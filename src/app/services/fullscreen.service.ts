import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FullscreenService {
  isFullscreen = false;

  toggleFullscreen() {
    if (!this.isFullscreen) {
      this.openFullscreen();
    } else {
      this.closeFullscreen();
    }
  }

  private openFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    }
    this.isFullscreen = true;
  }

  private closeFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    this.isFullscreen = false;
  }
}
