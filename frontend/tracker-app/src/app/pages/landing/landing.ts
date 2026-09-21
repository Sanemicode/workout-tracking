import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // Обов'язково для *ngIf
import { AuthService } from '../../services/auth';
import { TranslateModule } from '@ngx-translate/core'; // 1. Додаємо імпорт перекладу

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule], // Додано сюди
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing {
  // Робимо публічним, щоб HTML мав до нього доступ
  public authService = inject(AuthService); 
}