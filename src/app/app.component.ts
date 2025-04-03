import { Component, inject, HostBinding, effect, signal } from '@angular/core';
import { NgClass, AsyncPipe, NgIf } from '@angular/common';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { FullscreenService } from './services/fullscreen.service'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TodoListComponent, NgIf],
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
  darkMode = signal<boolean>(
    JSON.parse(window.localStorage.getItem('darkMode') ?? 'true')
  );
  animationTrigger = 0;
  fullscreen = inject(FullscreenService); 

  @HostBinding('class.dark') get mode() {
    return this.darkMode();
  }

  constructor() {
    effect(() => {
      window.localStorage.setItem('darkMode', JSON.stringify(this.darkMode()));
      this.animationTrigger++;
    });
  }

  toggleTheme() {
    this.darkMode.set(!this.darkMode());
  }


  toggleFullscreen() {
    this.fullscreen.toggleFullscreen();
  }
}
