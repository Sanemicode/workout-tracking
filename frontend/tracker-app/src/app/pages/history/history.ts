import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class History implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  allWorkouts: any[] = [];
  filteredWorkouts: any[] = [];
  availableTypes: string[] = ['Усі'];
  
  filterType: string = 'Усі';
  sortOrder: 'desc' | 'asc' = 'desc'; // desc = найновіші зверху

  totalDuration = 0;
  totalDistance = 0;

  ngOnInit() {
    this.loadWorkouts();
  }

  loadWorkouts() {
    this.http.get<any[]>('http://localhost:8000/api/workouts').subscribe({
      next: (data) => {
        this.allWorkouts = data;
        
        // Витягуємо унікальні види тренувань для випадаючого списку
        const types = new Set(data.map(w => w.workout_type));
        this.availableTypes = ['Усі', ...Array.from(types)];
        
        this.applyFilters();
      },
      error: (err) => console.error('Помилка завантаження:', err)
    });
  }

  applyFilters() {
    // 1. Фільтруємо за видом активності
    if (this.filterType === 'Усі') {
      this.filteredWorkouts = [...this.allWorkouts];
    } else {
      this.filteredWorkouts = this.allWorkouts.filter(w => w.workout_type === this.filterType);
    }

    // 2. Сортуємо за датою
    this.filteredWorkouts.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return this.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    // 3. Динамічно перераховуємо статистику ТІЛЬКИ для відфільтрованих записів
    this.totalDuration = this.filteredWorkouts.reduce((sum, w) => sum + Number(w.duration), 0);
    this.totalDistance = this.filteredWorkouts.reduce((sum, w) => sum + Number(w.distance), 0);
    
    this.cdr.detectChanges();
  }

  toggleSort() {
    this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
    this.applyFilters();
  }
}