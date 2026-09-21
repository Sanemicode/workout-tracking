import { Injectable, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private apiUrl = `${environment.apiUrl}/workouts`;
  constructor(private http: HttpClient) { }

  getWorkouts() {
    // Звертаємось до нашого Python бекенду
    return this.http.get(this.apiUrl); 
  }

// Видалення даних
  deleteWorkout(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

// НОВИЙ МЕТОД ДЛЯ РЕДАГУВАННЯ
  updateWorkout(id: number, workout: any) {
    return this.http.put(`${this.apiUrl}/${id}?workout_type=${workout.workout_type}&duration=${workout.duration}&distance=${workout.distance}`, {});
  }

addWorkout(workout: any) {
    const url = `${this.apiUrl}?workout_type=${workout.workout_type}&duration=${workout.duration}&distance=${workout.distance}`;
    return this.http.post(url, {});
  }
}

