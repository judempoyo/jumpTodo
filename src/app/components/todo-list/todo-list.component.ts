import { Component, inject,  HostBinding, effect, signal } from '@angular/core';
import { TodoService } from '../../services/todo.service';
import { NgClass, AsyncPipe, NgIf} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';
import { Todo } from '../../services/todo.service';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [NgClass, NgIf, FormsModule, AsyncPipe],
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
  editingTodoId: number | null = null;


  darkMode = signal<boolean>(
    JSON.parse(window.localStorage.getItem('darkMode') ?? 'true')
  );

  @HostBinding('class.dark') get mode() {
    return this.darkMode();
  }

  constructor() {
    effect(() => {
      window.localStorage.setItem('darkMode', JSON.stringify(this.darkMode()));
    });

  }

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

  startEdit(todo: Todo) {
    this.editingTodoId = todo.id;
    this.newTodoText = todo.text;
    setTimeout(() => {
      const inputElement = document.querySelector('input[ngModel]') as HTMLInputElement;
      inputElement?.focus();
      inputElement?.select();
    }, 50);
  }

  resetEdit() {
    this.editingTodoId = null;
    this.newTodoText = '';
  }



  ngOnInit() {

  }
}
