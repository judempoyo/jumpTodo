import { Component, inject, ViewChild } from '@angular/core';
import { TodoService } from '../../services/todo.service';
import { NgClass, AsyncPipe, NgIf,NgFor, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { animate, style, transition, trigger, query } from '@angular/animations';
import { Todo } from '../../services/todo.service';
import { CdkDragDrop, CdkDrag, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [NgClass,
    NgIf,
    FormsModule,
    AsyncPipe,
    CdkDrag,
    CdkDropList,
    CdkVirtualScrollViewport,
    ScrollingModule,
    NgFor,
    TitleCasePipe],
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
    ]),
    trigger('completeAnimation', [
      transition(':increment', [
        query('li.done', [
          style({ transform: 'translateX(0)' }),
          animate('0.5s ease-out',
            style({ transform: 'translateX(100%)', opacity: 0 }))
        ], { optional: true })
      ])
    ]),
    trigger('itemHover', [
      transition(':enter', []),
      transition(':leave', []),
      transition('* <=> *', [
        animate('0.2s ease', style({ transform: 'translateY(-3px)' }))
      ])
    ])
  ]
})
export class TodoListComponent {

  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;
  title = 'jumpTodo';
  todoService = inject(TodoService);
  newTodoText = '';
  editingTodoId: number | null = null;
  newTodoPriority: 'low' | 'medium' | 'high' = 'medium';
  newTodoDueDate?: string;
  showDatePicker = false;
  sortFields: (keyof Todo)[] = ['priority', 'dueDate', 'createdAt', 'text'];
  showSortDropdown = false;

  getSortFieldName(field: keyof Todo): string {
    return field === 'dueDate' ? 'Date d\'échéance' :
           field === 'createdAt' ? 'Date de création' :
           field === 'text' ? 'Texte' :
           'Priorité';
  }

  changeSortField(field: keyof Todo) {
    if (this.currentSort.field !== field) {
      this.todoService.setSort(field, 'asc');
    }
    this.showSortDropdown = false;
  }

  toggleSortDirection() {
    const newDirection = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    this.todoService.setSort(this.currentSort.field, newDirection);
    this.showSortDropdown = false;
  }

  get currentSort() {
    return this.todoService.getCurrentSort();
  }
  drop(event: CdkDragDrop<Todo[]>) {
    const movedItem = this.todoService.todos[event.previousIndex];
    const newTodos = [...this.todoService.todos];
    newTodos.splice(event.previousIndex, 1);
    newTodos.splice(event.currentIndex, 0, movedItem);

    this.todoService.reorderTodos(newTodos).subscribe();
  }
  addOrUpdateTodo() {
    if (!this.newTodoText.trim()) return;

    const dueDate = this.newTodoDueDate ? new Date(this.newTodoDueDate) : undefined;

    if (this.editingTodoId) {
      this.todoService.updateTodo(
        this.editingTodoId,
        this.newTodoText,
        this.newTodoPriority,
        dueDate
      ).subscribe({
        next: () => this.resetEdit(),
        error: (err) => console.error(err)
      });
    } else {
      this.todoService.addTodo(
        this.newTodoText,
        this.newTodoPriority,
        dueDate
      ).subscribe({
        next: () => this.resetEdit(),
        error: (err) => console.error(err)
      });
    }
  }

  resetEdit() {
    this.editingTodoId = null;
    this.newTodoText = '';
    this.newTodoPriority = 'medium';
    this.newTodoDueDate = undefined;
    this.showDatePicker = false;
  }

  getPriorityClass(priority: string) {
    return {
      'low': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'high': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }[priority];
  }

  formatDueDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  isOverdue(todo: Todo): boolean {
    if (!todo.dueDate || todo.done) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(todo.dueDate) < today;
  }
  startEdit(todo: Todo) {
    this.editingTodoId = todo.id;
    this.newTodoText = todo.text;
    this.newTodoPriority = todo.priority;
    this.newTodoDueDate = todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : undefined;

    setTimeout(() => {
      const inputElement = document.querySelector('input[ngModel]') as HTMLInputElement;
      inputElement?.focus();
      inputElement?.select();
    }, 50);
  }
  handleTodoClick(todo: Todo, event: MouseEvent) {
    if (event.detail === 2) {
      this.startEdit(todo);
    }
  }
}

