import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

export interface Todo {
  id: number;
  text: string;
  done: boolean;
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

  addTodo(text: string): Observable<Todo> {
    if (!text.trim()) {
      throw new Error('Todo text cannot be empty');
    }

    const newTodo: Todo = {
      id: Date.now(),
      text,
      done: false,
      createdAt: new Date()
    };

    return this.updateTodos([...this.todos, newTodo]).pipe(
      map(todos => todos.find(t => t.id === newTodo.id)!),
      tap(() => console.log('Todo added successfully')),
      catchError(error => {
        console.error('Error adding todo:', error);
        throw error;
      })
    );
  }

  updateTodo(id: number, newText: string): Observable<Todo> {
    if (!newText.trim()) {
      throw new Error('Todo text cannot be empty');
    }

    const updatedTodos = this.todos.map(todo =>
      todo.id === id
        ? {
            ...todo,
            text: newText,
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
      tap(() => console.log('Todo updated successfully')),
      catchError(error => {
        console.error('Error updating todo:', error);
        throw error;
      })
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
