import { Injectable, signal, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';
  
  // Отримуємо поточну платформу (браузер чи сервер)
  private platformId = inject(PLATFORM_ID);

  currentUser = signal<string | null>(this.getToken());

  constructor(private http: HttpClient) {}

  register(user: any) {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(credentials: any) {
    const body = new HttpParams()
      .set('username', credentials.email)
      .set('password', credentials.password);

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    return this.http.post<any>(`${this.apiUrl}/login`, body.toString(), { headers }).pipe(
      tap(response => {
        this.setToken(response.access_token);
      })
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
    this.currentUser.set(null);
  }

  private setToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
    }
    this.currentUser.set(token);
  }

  getToken() {
    // Звертаємося до localStorage ТІЛЬКИ якщо ми в браузері
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null; // На сервері просто повертаємо null
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}