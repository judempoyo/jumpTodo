import { Component, inject } from '@angular/core';
//import { TodoService } from '../services/todo.service';
import { NgClass, NgFor, NgIf, AsyncPipe } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { TodoService } from '../../services/todo.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [NgFor, NgIf, NgClass,FormsModule,AsyncPipe],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(20px)' })),
      ]),
    ]),
  ],
})
export class TodoListComponent {
  todoService = inject(TodoService);
  newTodoText = '';
  isDarkMode = false;

  addTodo() {
    if (this.newTodoText.trim()) {
      this.todoService.addTodo(this.newTodoText);
      this.newTodoText = '';
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }
}
