import { Injectable, signal, effect } from '@angular/core';

type Theme = 'teal' | 'emerald' | 'indigo';
type Mode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'app_theme';
  private readonly MODE_KEY = 'color_mode';

  currentTheme = signal<Theme>('teal');
  currentMode = signal<Mode>('light');
  availableThemes: Theme[] = ['teal', 'emerald', 'indigo'];

  constructor() {
    // Chargement initial
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    const savedMode = localStorage.getItem(this.MODE_KEY) as Mode;

    if (savedTheme && this.availableThemes.includes(savedTheme)) {
      this.currentTheme.set(savedTheme);
    }

    if (savedMode) {
      this.currentMode.set(savedMode);
    }

    // Effet pour sauvegarder les changements
    effect(() => {
      localStorage.setItem(this.THEME_KEY, this.currentTheme());
      localStorage.setItem(this.MODE_KEY, this.currentMode());
      this.applyTheme();
    });
  }

  setTheme(theme: Theme) {
    this.currentTheme.set(theme);
  }

  toggleMode() {
    this.currentMode.update(mode => mode === 'light' ? 'dark' : 'light');
  }

  private applyTheme() {
    document.documentElement.className = `${this.currentTheme()}-${this.currentMode()}`;
  }
}
