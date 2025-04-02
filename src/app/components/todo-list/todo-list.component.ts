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
  styleUrls: ['./todo-list.component.scss'],
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
  editingTodoId: number | null = null;

  addOrUpdateTodo() {
    if (!this.newTodoText.trim()) return;

    if (this.editingTodoId) {
      this.todoService.updateTodo(this.editingTodoId, this.newTodoText).subscribe({
        next: () => this.resetEdit(),
        error: (err) => console.error(err)
      });
    } else {
      this.todoService.addTodo(this.newTodoText).subscribe({
        next: () => this.resetEdit(),
        error: (err) => console.error(err)
      });
    }
  }

  handleTodoClick(todo: Todo, event: MouseEvent) {
    if (event.detail === 2) { // Double-clic
      this.startEdit(todo);
    }
  } 
  startEdit(todo: { id: number, text: string }) {
    this.editingTodoId = todo.id;
    this.newTodoText = todo.text;
  }

  resetEdit() {
    this.editingTodoId = null;
    this.newTodoText = '';
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark', this.isDarkMode);
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  ngOnInit() {
    const savedMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedMode === 'true';
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }
}
