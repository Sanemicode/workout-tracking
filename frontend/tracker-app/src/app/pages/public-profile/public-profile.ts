import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './public-profile.html',
  styleUrl: './public-profile.css'
})
export class PublicProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef); // Повертаємо наш детектор змін

  username: string = '';
  workouts: any[] = [];
  isLoading = true;
  error = '';

  totalDuration = 0;
  totalDistance = 0;

  ngOnInit() {
    this.username = this.route.snapshot.paramMap.get('username') || '';
    
    if (this.username) {
      this.loadPublicData();
    }
  }

  loadPublicData() {
    this.http.get<any>(`http://localhost:8000/api/public/users/${this.username}/workouts`)
      .subscribe({
        next: (data) => {
          this.workouts = data.workouts || [];
          this.calculateStats();
          this.isLoading = false;
          this.cdr.detectChanges(); // Стусан для Angular, щоб приховав напис "Завантаження"
        },
        error: (err) => {
          this.error = 'Користувача не знайдено або профіль закритий.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  calculateStats() {
    this.totalDuration = this.workouts.reduce((sum, w) => sum + Number(w.duration), 0);
    this.totalDistance = this.workouts.reduce((sum, w) => sum + Number(w.distance), 0);
  }
}