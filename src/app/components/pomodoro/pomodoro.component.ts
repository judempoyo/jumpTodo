import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PomodoroService } from '../../services/pomodoro.service';

@Component({
  selector: 'app-pomodoro',
  imports: [CommonModule],
  templateUrl: './pomodoro.component.html',
  styleUrl: './pomodoro.component.css'
})
export class PomodoroComponent {
  pomodoro = inject(PomodoroService);
  isVisible = signal(false);
  toggleVisibility() {
    this.isVisible.update(v => !v); 
  }
}
