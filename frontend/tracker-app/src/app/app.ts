import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router'; // Додано Router
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, TranslateModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  authService = inject(AuthService);
  // Щоб використовувати router.url в HTML, треба зробити його публічним
  public router = inject(Router); 
  private translate = inject(TranslateService);

  constructor() {
    this.translate.setDefaultLang('ua');
    this.translate.use('ua');
  }

  get currentUsername() {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('username') || '';
    }
    return '';
  }

  // ДОДАЄМО: Перевіряємо, чи ми зараз на сторінці логіну
  get isAuthPage() {
    return this.router.url === '/login';
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }

  logout() {
    this.authService.logout();
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('username');
    }
    this.router.navigate(['/login']);
  }
}