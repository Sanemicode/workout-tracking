import { Injectable, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private apiUrl = 'http://localhost:8000/api/workouts';
  constructor(private http: HttpClient) { }

  getWorkouts() {
    // Звертаємось до нашого Python бекенду
    return this.http.get('http://127.0.0.1:8000/api/workouts'); 
  }

// Видалення даних
  deleteWorkout(id: number) {
    return this.http.delete(`http://127.0.0.1:8000/api/workouts/${id}`);
  }

// НОВИЙ МЕТОД ДЛЯ РЕДАГУВАННЯ
  updateWorkout(id: number, workout: any) {
    return this.http.put(`${this.apiUrl}/${id}?workout_type=${workout.workout_type}&duration=${workout.duration}&distance=${workout.distance}`, {});
  }

addWorkout(workout: any) {
    const url = `http://127.0.0.1:8000/api/workouts?workout_type=${workout.workout_type}&duration=${workout.duration}&distance=${workout.distance}`;
    return this.http.post(url, {});
  }
}

