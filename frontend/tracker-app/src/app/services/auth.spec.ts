import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api`;
  
  // Використовуємо Signals для відстеження стану авторизації
  currentUser = signal<string | null>(this.getToken());

  constructor(private http: HttpClient) {}

  register(user: any) {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(credentials: any) {
    // FastAPI (OAuth2) вимагає дані у форматі URL-кодованої форми
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
    localStorage.removeItem('token');
    this.currentUser.set(null);
  }

  private setToken(token: string) {
    localStorage.setItem('token', token);
    this.currentUser.set(token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}