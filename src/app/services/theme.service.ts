import { Injectable, signal, effect } from '@angular/core';

type Theme = 'teal' | 'emerald' | 'indigo';
type Mode = 'light' | 'dark';@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'app_theme';
  private readonly MODE_KEY = 'app_mode';

  currentTheme = signal<Theme>('teal');
  currentMode = signal<Mode>('light');
  availableThemes: Theme[] = ['teal', 'emerald', 'indigo'];

  constructor() {
    // Charger le thème sauvegardé
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme && this.availableThemes.includes(savedTheme as Theme)) {
      this.currentTheme.set(savedTheme as Theme);
    }

    // Charger le mode sauvegardé
    const savedMode = localStorage.getItem(this.MODE_KEY);
    if (savedMode === 'light' || savedMode === 'dark') {
      this.currentMode.set(savedMode);
    }

    // Appliquer le thème au démarrage
    this.applyTheme();
  }

  setTheme(theme: Theme) {
    this.currentTheme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme();
  }

  toggleMode() {
    this.currentMode.update(mode => {
      const newMode = mode === 'light' ? 'dark' : 'light';
      localStorage.setItem(this.MODE_KEY, newMode);
      return newMode;
    });
    this.applyTheme();
  }

  private applyTheme() {
    // Appliquer les classes au documentElement
    document.documentElement.classList.remove(
      'teal-light', 'teal-dark',
      'emerald-light', 'emerald-dark',
      'indigo-light', 'indigo-dark'
    );
    document.documentElement.classList.add(`${this.currentTheme()}-${this.currentMode()}`);

    // Ajouter/retirer la classe dark pour Tailwind
    if (this.currentMode() === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  getThemeColor(type: 'primary'|'text'|'bg'|'surface') {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--${type}-color`);
  }
}
