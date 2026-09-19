import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class History implements OnInit {
  private http = inject(HttpClient);
  // 1. Підключаємо сервіс оновлення екрану
  private cdr = inject(ChangeDetectorRef);

  workouts: any[] = [];
  totalDistance: number = 0;
  totalDuration: number = 0;

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.http.get<any[]>('http://localhost:8000/api/workouts').subscribe({
      next: (data) => {
        this.workouts = data;
        this.calculateStats();
        
        // 2. Смикаємо Angular: "Дані прийшли, перемалюй таблицю і статистику негайно!"
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Помилка завантаження історії:', err)
    });
  }

  calculateStats() {
    this.totalDistance = this.workouts.reduce((sum, w) => sum + w.distance, 0);
    this.totalDuration = this.workouts.reduce((sum, w) => sum + w.duration, 0);
  }
}