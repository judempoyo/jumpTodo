import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

export interface Todo {
  id: number;
  text: string;
  done: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date | string;
  createdAt: Date;
  updatedAt?: Date;
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly STORAGE_KEY = 'angular_todos';
  private todosSubject = new BehaviorSubject<Todo[]>([]);
  todos$ = this.todosSubject.asObservable();

  get todos(): Todo[] {
    return this.todosSubject.value;
  }

  constructor() {
    this.loadTodos();
  }

  private loadTodos(): void {
    try {
      const savedTodos = localStorage.getItem(this.STORAGE_KEY);
      if (savedTodos) {
        const todos = JSON.parse(savedTodos);
        this.todosSubject.next(todos.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: todo.updatedAt ? new Date(todo.updatedAt) : undefined
        })));
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
      this.todosSubject.next([]);
    }
  }

    addTodo(text: string, priority: 'low' | 'medium' | 'high' = 'medium', dueDate?: Date): Observable<Todo> {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      done: false,
      priority,
      dueDate,
      createdAt: new Date(),
    };
    this.todosSubject.next([...this.todos, newTodo]);
    return of(newTodo);
  }

  updateTodo(id: number, text: string, priority?: 'low' | 'medium' | 'high', dueDate?: Date): Observable<void> {
    const updatedTodos = this.todos.map(todo =>
      todo.id === id ? { ...todo, text, priority: priority ?? todo.priority, dueDate } : todo
    );
    this.todosSubject.next(updatedTodos);
    return of(undefined);
  }

  getTodosByPriority(): Todo[] {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return [...this.todos].sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  }

  getOverdueTodos(): Todo[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.todos.filter(todo =>
      todo.dueDate && new Date(todo.dueDate) < today && !todo.done
    );
  }

  toggleTodo(id: number): Observable<Todo> {
    const updatedTodos = this.todos.map(todo =>
      todo.id === id
        ? {
            ...todo,
            done: !todo.done,
            updatedAt: new Date()
          }
        : todo
    );

    const updatedTodo = updatedTodos.find(t => t.id === id);
    if (!updatedTodo) {
      throw new Error('Todo not found');
    }

    return this.updateTodos(updatedTodos).pipe(
      map(() => updatedTodo),
      tap(() => console.log('Todo toggled successfully')),
      catchError(error => {
        console.error('Error toggling todo:', error);
        throw error;
      })
    );
  }

  deleteTodo(id: number): Observable<boolean> {
    const updatedTodos = this.todos.filter(todo => todo.id !== id);
    return this.updateTodos(updatedTodos).pipe(
      map(() => true),
      tap(() => console.log('Todo deleted successfully')),
      catchError(error => {
        console.error('Error deleting todo:', error);
        throw error;
      })
    );
  }

  private updateTodos(todos: Todo[]): Observable<Todo[]> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(todos));
      this.todosSubject.next(todos);
      return of(todos);
    } catch (error) {
      console.error('Failed to save todos:', error);
      throw error;
    }
  }

  getActiveCount(): number {
    return this.todos.filter(t => !t.done).length;
  }

  getCompletedCount(): number {
    return this.todos.filter(t => t.done).length;
  }

  getTodoById(id: number): Todo | undefined {
    return this.todos.find(todo => todo.id === id);
  }
  reorderTodos(newOrder: Todo[]): Observable<any> {
    this.todosSubject.next([...newOrder]);
    return of(null);
  }
}
