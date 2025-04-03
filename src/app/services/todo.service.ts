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
        const parsedTodos = todos.map((todo: any) => ({
          ...todo,
          priority: todo.priority || 'medium',
          createdAt: new Date(todo.createdAt),
          updatedAt: todo.updatedAt ? new Date(todo.updatedAt) : undefined,
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
        }));
        this.todosSubject.next(parsedTodos);
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
      this.todosSubject.next([]);
    }
  }
  private saveTodos(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.todos));
    } catch (error) {
      console.error('Failed to save todos:', error);
    }
  }

  addTodo(text: string, priority: 'low' | 'medium' | 'high' = 'medium', dueDate?: Date): Observable<Todo> {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      done: false,
      priority,
      dueDate,
      createdAt: new Date()
    };
    const updatedTodos = [...this.todos, newTodo];
    this.todosSubject.next(updatedTodos);
    this.saveTodos();
    return of(newTodo);
  }

  updateTodo(id: number, text: string, priority?: 'low' | 'medium' | 'high', dueDate?: Date): Observable<void> {
    const updatedTodos = this.todos.map(todo =>
      todo.id === id ? {
        ...todo,
        text,
        priority: priority ?? todo.priority,
        dueDate,
        updatedAt: new Date()
      } : todo
    );
    this.todosSubject.next(updatedTodos);
    this.saveTodos();
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
      todo.id === id ? {
        ...todo,
        done: !todo.done,
        updatedAt: new Date()
      } : todo
    );

    const updatedTodo = updatedTodos.find(t => t.id === id);
    if (!updatedTodo) {
      throw new Error('Todo not found');
    }

    this.todosSubject.next(updatedTodos);
    this.saveTodos();
    return of(updatedTodo);
  }


  deleteTodo(id: number): Observable<boolean> {
    const updatedTodos = this.todos.filter(todo => todo.id !== id);
    this.todosSubject.next(updatedTodos);
    this.saveTodos();
    return of(true);
  }

  reorderTodos(newOrder: Todo[]): Observable<void> {
    // First check if the order actually changed to prevent unnecessary updates
    const currentIds = this.todos.map(t => t.id).join(',');
    const newIds = newOrder.map(t => t.id).join(',');

    if (currentIds === newIds) {
      return of(undefined); // No change needed
    }

    // Validate the new order
    if (!Array.isArray(newOrder)) {
      throw new Error('Invalid todo order provided');
    }

    if (newOrder.length !== this.todos.length) {
      throw new Error('Todo count mismatch during reorder');
    }

    // Create a completely new array to break any potential references
    const updatedTodos = newOrder.map(todo => ({...todo}));

    // Update state
    this.todosSubject.next(updatedTodos);

    // Save to storage
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedTodos));
    } catch (error) {
      console.error('Failed to save todos:', error);
      throw error;
    }

    return of(undefined);
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

}
