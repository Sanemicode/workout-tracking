import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class AuthComponent implements OnInit {
  isLoginMode = true; // За замовчуванням показуємо форму входу
  email = '';
  password = '';
  errorMessage = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  // Додали перевірку при завантаженні сторінки
  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
  }

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Заповніть всі поля';
      return;
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('username', this.email.split('@')[0]);
    }

    const credentials = { email: this.email, password: this.password };

    if (this.isLoginMode) {
      // Логіка входу
      this.authService.login(credentials).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']); // Редирект на дашборд після успішного входу
        },
        error: () => this.errorMessage = 'Неправильний email або пароль'
      });
    } else {
      // Логіка реєстрації
      this.authService.register(credentials).subscribe({
        next: () => {
          this.isLoginMode = true; 
          this.errorMessage = '';
          alert('Реєстрація успішна! Тепер увійдіть.');
        },
        error: (err) => this.errorMessage = err.error?.detail || 'Помилка реєстрації. Можливо, email вже зайнятий.'
      });
    }
  }
}