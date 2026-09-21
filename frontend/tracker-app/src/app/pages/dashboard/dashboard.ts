import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';

// Імпорти для графіків
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';

// Обов'язкова реєстрація компонентів Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, TranslateModule], // Додали BaseChartDirective сюди
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private translate = inject(TranslateService);

  workouts: any[] = [];
  
  // Змінні для форми
  workoutType = 'Біг';
  duration: number | null = null;
  distance: number | null = null;
  workoutDate: string = new Date().toISOString().split('T')[0];

  editingId: number | null = null;

  // --- Змінні для Графіка (Кругова діаграма) ---
  public chartLabels: string[] = [];
  public chartData: any[] = [
    { 
      data: [], 
      backgroundColor: ['#0d6efd', '#20c997', '#ffc107', '#fd7e14', '#d63384', '#6f42c1'] 
    }
  ];
  public chartOptions: any = { 
    responsive: true, 
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  ngOnInit() {
    this.loadWorkouts();
  }

  loadWorkouts() {
    this.http.get<any>('http://localhost:8000/api/workouts').subscribe({
      next: (data) => {
        this.workouts = data; 
        this.updateCharts(); // Оновлюємо графік
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Помилка завантаження:', err)
    });
  }

  submitForm() {
    if (!this.workoutType || !this.duration || !this.distance || !this.workoutDate) return;

    if (this.editingId) {
      const url = `http://localhost:8000/api/workouts/${this.editingId}?workout_type=${this.workoutType}&duration=${this.duration}&distance=${this.distance}&workout_date=${this.workoutDate}`;
      
      this.http.put(url, {}).subscribe({
        next: (updatedWorkout) => {
          const index = this.workouts.findIndex(w => w.id === this.editingId);
          if (index !== -1) {
            this.workouts[index] = updatedWorkout;
          }
          this.resetForm();
          this.updateCharts(); // Оновлюємо графік
          this.cdr.detectChanges();
        }
      });
    } else {
      const url = `http://localhost:8000/api/workouts?workout_type=${this.workoutType}&duration=${this.duration}&distance=${this.distance}&workout_date=${this.workoutDate}`;
      
      this.http.post(url, {}).subscribe({
        next: (newWorkout) => {
          this.workouts.push(newWorkout); 
          this.resetForm();
          this.updateCharts(); // Оновлюємо графік
          this.cdr.detectChanges(); 
        }
      });
    }
  }

  startEdit(workout: any) {
    this.editingId = workout.id;
    this.workoutType = workout.workout_type;
    this.duration = workout.duration;
    this.distance = workout.distance;
    this.workoutDate = workout.date || new Date().toISOString().split('T')[0];
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
        this.updateCharts(); // Оновлюємо графік
        this.cdr.detectChanges();
      }
    });
  }

  enableNotifications() {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('WorkoutTracker', {
            // Використовуємо this.translate.instant для миттєвого перекладу
            body: this.translate.instant('NOTIFICATIONS.SUCCESS_BODY'),
            icon: '/icons/icon-72x72.png'
          });
        } else {
          alert(this.translate.instant('NOTIFICATIONS.DENIED_ALERT'));
        }
      });
    } else {
      alert(this.translate.instant('NOTIFICATIONS.UNSUPPORTED_ALERT'));
    }
  }

  // --- Функція перерахунку даних для графіка ---
  updateCharts() {
    const typeMap = new Map<string, number>();
    
    // Групуємо час за видами тренувань
    this.workouts.forEach(w => {
      const current = typeMap.get(w.workout_type) || 0;
      typeMap.set(w.workout_type, current + Number(w.duration));
    });

    this.chartLabels = Array.from(typeMap.keys());
    this.chartData[0].data = Array.from(typeMap.values());
    
    // Створюємо новий об'єкт масиву, щоб Angular точно помітив зміни і перемалював Canvas
    this.chartData = [...this.chartData]; 
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}