import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // Обов'язково для *ngIf
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterModule, CommonModule], // Додано сюди
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing {
  // Робимо публічним, щоб HTML мав до нього доступ
  public authService = inject(AuthService); 
}