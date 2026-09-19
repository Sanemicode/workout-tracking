import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  workouts: any[] = [];
  
  // Змінні для форми
  workoutType = 'Біг';
  duration: number | null = null;
  distance: number | null = null;

  ngOnInit() {
    this.loadWorkouts();
  }

  loadWorkouts() {
  this.http.get<any>('http://localhost:8000/api/workouts').subscribe({
    next: (data) => {
      console.log('Дашборд отримав дані:', data); // Дивимось, що реально прийшло
      this.workouts = data; 
      this.cdr.detectChanges();
    },
    error: (err) => console.error('Помилка завантаження дашборду:', err)
  });
}

  addWorkout() {
    if (!this.workoutType || !this.duration || !this.distance) return;

    // FastAPI очікує дані як query-параметри
    const url = `http://localhost:8000/api/workouts?workout_type=${this.workoutType}&duration=${this.duration}&distance=${this.distance}`;
    
    this.http.post(url, {}).subscribe({
      next: (newWorkout) => {
        this.workouts.push(newWorkout); // Одразу додаємо в список на екрані
        // Очищаємо форму
        this.duration = null;
        this.distance = null;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Помилка додавання:', err)
    });
  }

  deleteWorkout(id: number) {
    if (!confirm('Точно видалити це тренування?')) return;

    this.http.delete(`http://localhost:8000/api/workouts/${id}`).subscribe({
      next: () => {
        // Видаляємо картку з масиву на екрані
        this.workouts = this.workouts.filter(w => w.id !== id);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Помилка видалення:', err)
    });
  }


  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}