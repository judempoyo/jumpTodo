import { Injectable, signal, effect } from '@angular/core';

type Theme = 'teal' | 'emerald' | 'indigo';
type Mode = 'light' | 'dark';
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'app_theme';
  currentTheme = signal<'teal'|'emerald'|'indigo'>('teal');
  currentMode = signal<'light'|'dark'>('light');
  availableThemes: Theme[] = ['teal', 'emerald', 'indigo'];

  constructor() {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme) this.currentTheme.set(savedTheme as any);
  }

  setTheme(theme: 'teal'|'emerald'|'indigo') {
    this.currentTheme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme();
    console.log('Theme set to:', theme);
  }

  toggleMode() {
    this.currentMode.update(mode => mode === 'light' ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    document.documentElement.className = `${this.currentTheme()}-${this.currentMode()}`;
  }

  getThemeColor(type: 'primary'|'text'|'bg'|'surface') {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--${type}-color`);
  }
}
