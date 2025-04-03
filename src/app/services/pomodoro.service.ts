import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PomodoroService {
  timer = signal(25 * 60);
  isRunning = signal(false);
  mode = signal<'work' | 'break'>('work');
  private interval: any;

  start() {
    this.isRunning.set(true);
    this.interval = setInterval(() => {
      this.timer.update(t => {
        if (t <= 0) {
          this.switchMode();
          return this.mode() === 'work' ? 25 * 60 : 5 * 60;
        }
        return t - 1;
      });
    }, 1000);
  }

  pause() {
    this.isRunning.set(false);
    clearInterval(this.interval);
  }

  reset() {
    this.pause();
    this.timer.set(25 * 60);
    this.mode.set('work');
  }

  private switchMode() {
    this.mode.update(m => m === 'work' ? 'break' : 'work');

  }

  get formattedTime() {
    const minutes = Math.floor(this.timer() / 60);
    const seconds = this.timer() % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
}
