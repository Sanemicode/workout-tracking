import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Додали ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { WorkoutService } from '../../services/workout';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  workouts: any[] = [];
  newWorkout = { workout_type: '', duration: null, distance: null };

  public pieChartLabels: string[] = [];
  public pieChartDatasets = [{ data: [] as number[] }];
  public pieChartOptions = { responsive: true };

  constructor(
    private workoutService: WorkoutService,
    private cdr: ChangeDetectorRef // 2. Зареєстрували детектор змін
  ) {}

  ngOnInit() {
    this.loadWorkouts();
  }

  loadWorkouts() {
    this.workoutService.getWorkouts().subscribe(data => {
      this.workouts = data as any[];
      this.updateChart();
      
      this.cdr.detectChanges(); // 3. ПРИМУСОВО кажемо Angular оновити екран прямо зараз!
    });
  }

  addWorkout() {
    if (!this.newWorkout.workout_type) return;
    this.workoutService.addWorkout(this.newWorkout).subscribe(() => {
      this.loadWorkouts();
      this.newWorkout = { workout_type: '', duration: null, distance: null };
    });
  }

  deleteWorkout(id: number) {
    this.workoutService.deleteWorkout(id).subscribe(() => {
      this.loadWorkouts();
    });
  }

  updateChart() {
    const stats: any = {};
    this.workouts.forEach(w => {
      if (stats[w.workout_type]) {
        stats[w.workout_type] += w.duration;
      } else {
        stats[w.workout_type] = w.duration;
      }
    });
    this.pieChartLabels = Object.keys(stats);
    this.pieChartDatasets = [{ data: Object.values(stats) }];
  }
}