import { Component, effect, inject } from '@angular/core';
import { NgClass, AsyncPipe, NgIf } from '@angular/common';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { FullscreenService } from './services/fullscreen.service';
import { PomodoroComponent } from './components/pomodoro/pomodoro.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TodoListComponent, NgIf, NgClass, PomodoroComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('themeSwitch', [
      transition(':increment, :decrement', [
        style({ transform: 'scale(0.8)', opacity: 0.5 }),
        animate('500ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ])
  ]
})
export class AppComponent {
  title = 'jumpTodo';
  theme = inject(ThemeService);
  fullscreen = inject(FullscreenService);
  animationTrigger = 0;

  constructor() {

    effect(() => {
      this.animationTrigger++;
    });
  }

  toggleTheme() {
    this.theme.toggleMode();
    console.log('themes:', this.theme.availableThemes);
  }

  toggleFullscreen() {
    this.fullscreen.toggleFullscreen();
  }
}
