import { Component, inject } from '@angular/core';
import { TodoService } from '../../services/todo.service';
import { NgClass, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [NgClass, FormsModule, AsyncPipe],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('150ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateX(20px)' }))
      ])
    ])
  ]
})
export class TodoListComponent {
  todoService = inject(TodoService);
  newTodoText = '';
  isDarkMode = false;
  editingTodo: { id: number, text: string } | null = null;

  addTodo() {
    if (this.newTodoText.trim()) {
      if (this.editingTodo) {
        this.todoService.updateTodo(this.editingTodo.id, this.newTodoText);
        this.editingTodo = null;
      } else {
        this.todoService.addTodo(this.newTodoText);
      }
      this.newTodoText = '';
    }
  }

  startEdit(todo: { id: number, text: string }) {
    this.editingTodo = todo;
    this.newTodoText = todo.text;
  }

  cancelEdit() {
    this.editingTodo = null;
    this.newTodoText = '';
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }

  get activeCount() {
    return this.todoService.todos.filter(t => !t.done).length;
  }

  get totalCount() {
    return this.todoService.todos.length;
  }
}
