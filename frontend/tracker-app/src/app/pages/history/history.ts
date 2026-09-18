import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutService } from '../../services/workout';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.html',
})
export class History implements OnInit {
  // 1. Створюємо Сигнал замість звичайного масиву
  workouts = signal<any[]>([]);

  constructor(private workoutService: WorkoutService) {}

  ngOnInit() {
    this.loadWorkouts();
  }

  loadWorkouts() {
    this.workoutService.getWorkouts().subscribe(data => {
      // 2. Записуємо отримані дані всередину Сигналу через метод .set()
      this.workouts.set(data as any[]);
    });
  }

  deleteWorkout(id: number) {
    this.workoutService.deleteWorkout(id).subscribe(() => {
      this.loadWorkouts(); 
    });
  }
}