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
  workoutDate: string = new Date().toISOString().split('T')[0];

  editingId: number | null = null;

  ngOnInit() {
    this.loadWorkouts();
  }

  loadWorkouts() {
    this.http.get<any>('http://localhost:8000/api/workouts').subscribe({
      next: (data) => {
        console.log('Дашборд отримав дані:', data);
        this.workouts = data; 
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Помилка завантаження дашборду:', err)
    });
  }

  // Цей метод тепер вміє і створювати нове, і оновлювати старе
  submitForm() {
    if (!this.workoutType || !this.duration || !this.distance || !this.workoutDate) return;

    if (this.editingId) {
      // Режим РЕДАГУВАННЯ
      const url = `http://localhost:8000/api/workouts/${this.editingId}?workout_type=${this.workoutType}&duration=${this.duration}&distance=${this.distance}&workout_date=${this.workoutDate}`;
      
      this.http.put(url, {}).subscribe({
        next: (updatedWorkout) => {
          const index = this.workouts.findIndex(w => w.id === this.editingId);
          if (index !== -1) {
            this.workouts[index] = updatedWorkout;
          }
          this.resetForm();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Помилка оновлення:', err)
      });
    } else {
      // Режим СТВОРЕННЯ
      const url = `http://localhost:8000/api/workouts?workout_type=${this.workoutType}&duration=${this.duration}&distance=${this.distance}&workout_date=${this.workoutDate}`;
      
      this.http.post(url, {}).subscribe({
        next: (newWorkout) => {
          this.workouts.push(newWorkout); 
          this.resetForm();
          this.cdr.detectChanges(); 
        },
        error: (err) => console.error('Помилка додавання:', err)
      });
    }
  }

  // Метод, який перекидає дані з картки у форму для редагування
  startEdit(workout: any) {
    this.editingId = workout.id;
    this.workoutType = workout.workout_type;
    this.duration = workout.duration;
    this.distance = workout.distance;
    this.workoutDate = workout.date || new Date().toISOString().split('T')[0];
    
    // Плавно скролимо екран догори до форми
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Метод для очищення форми
  resetForm() {
    this.editingId = null;
    this.duration = null;
    this.distance = null;
    this.workoutDate = new Date().toISOString().split('T')[0];
  }

  deleteWorkout(id: number) {
    if (!confirm('Точно видалити це тренування?')) return;

    this.http.delete(`http://localhost:8000/api/workouts/${id}`).subscribe({
      next: () => {
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