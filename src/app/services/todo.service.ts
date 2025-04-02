import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';

export interface Todo {
  id: number;
  text: string;
  done: boolean;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly STORAGE_KEY = 'angular_todos';
  private todosSubject = new BehaviorSubject<Todo[]>([]);
  todos$ = this.todosSubject.asObservable();

  constructor() {
    this.loadTodos();
  }

  private loadTodos() {
    try {
      const savedTodos = localStorage.getItem(this.STORAGE_KEY);
      if (savedTodos) {
        const todos = JSON.parse(savedTodos);
        this.todosSubject.next(todos);
      }
    } catch (error) {
      console.error('Failed to load todos:', error);
      this.todosSubject.next([]);
    }
  }

  addTodo(text: string) {
    if (!text.trim()) {
      return of(null).pipe(
        catchError(err => {
          throw new Error('Todo text cannot be empty');
        })
      );
    }

    const newTodo: Todo = {
      id: Date.now(),
      text,
      done: false,
      createdAt: new Date(),
    };

    const updatedTodos = [...this.todosSubject.value, newTodo];
    this.todosSubject.next(updatedTodos);
    this.saveTodos(updatedTodos);

    return of(newTodo).pipe(
      tap(() => console.log('Todo added!')),
      catchError(err => {
        throw new Error('Failed to add todo');
      })
    );
  }

  toggleTodo(id: number) {
    const updatedTodos = this.todosSubject.value.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    );
    this.todosSubject.next(updatedTodos);
    this.saveTodos(updatedTodos);
  }

  deleteTodo(id: number) {
    const updatedTodos = this.todosSubject.value.filter(todo => todo.id !== id);
    this.todosSubject.next(updatedTodos);
    this.saveTodos(updatedTodos);
  }

  private saveTodos(todos: Todo[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      console.error('Failed to save todos:', error);
    }
  }
}
