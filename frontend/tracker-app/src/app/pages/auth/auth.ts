import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { TranslateModule } from '@ngx-translate/core';

declare var FB: any;

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class AuthComponent implements OnInit {
  isLoginMode = true;
  email = '';
  password = '';
  errorMessage = '';

  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }

    if (typeof window !== 'undefined') {
      (window as any).fbAsyncInit = () => {
        FB.init({
          appId      : '1048871024654239', 
          cookie     : true,
          xfbml      : true,
          version    : 'v19.0'
        });
      };
    }
  }

  loginWithFacebook() {
    if (typeof FB === 'undefined') {
      this.errorMessage = 'Facebook ще завантажується, спробуйте через секунду.';
      return;
    }

    FB.login((response: any) => {
      if (response.authResponse) {
        FB.api('/me', {fields: 'name,id'}, (userInfo: any) => {
          
          const safeName = userInfo.name.replace(/\s+/g, '').toLowerCase();
          const generatedUsername = `${safeName}_${userInfo.id}`;
          const generatedEmail = `${generatedUsername}@fb.local`;
          const generatedPassword = `FbSecret_${userInfo.id}!`;

          const credentials = { email: generatedEmail, password: generatedPassword };

          this.authService.login(credentials).subscribe({
            next: () => {
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem('username', generatedUsername); 
              }
              this.router.navigate(['/dashboard']).then(() => window.location.reload());
            },
            error: () => {
              this.authService.register(credentials).subscribe({
                next: () => {
                  this.authService.login(credentials).subscribe({
                    next: () => {
                      if (typeof localStorage !== 'undefined') {
                        localStorage.setItem('username', generatedUsername);
                      }
                      this.router.navigate(['/dashboard']).then(() => window.location.reload());
                    }
                  });
                },
                error: () => this.errorMessage = 'Помилка збереження профілю Facebook на сервері.'
              });
            }
          });
        });
      } else {
        this.errorMessage = 'Користувач скасував вхід через Facebook.';
      }
    }, {scope: 'public_profile'});
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

    const credentials = { email: this.email, password: this.password };

    if (this.isLoginMode) {
      this.authService.login(credentials).subscribe({
        next: () => {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('username', this.email.split('@')[0]);
          }
          this.router.navigate(['/dashboard']);
        },
        error: () => this.errorMessage = 'Неправильний email або пароль'
      });
    } else {
      this.authService.register(credentials).subscribe({
        next: () => {
          this.isLoginMode = true; 
          this.errorMessage = '';
          alert('Реєстрація успішна! Тепер увійдіть.');
        },
        error: (err) => this.errorMessage = err.error?.detail || 'Помилка реєстрації.'
      });
    }
  }
}