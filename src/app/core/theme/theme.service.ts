import { Injectable, signal } from '@angular/core';

export type ThemePreference = 'system' | 'light' | 'dark';
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly preference = signal<ThemePreference>(this.readPreference());
  private readonly media = window.matchMedia('(prefers-color-scheme: dark)');
  constructor() {
    this.apply(this.preference());
    this.media.addEventListener('change', () => { if (this.preference() === 'system') this.apply('system'); });
  }
  set(preference: ThemePreference) { this.preference.set(preference); localStorage.setItem('rk-theme', preference); this.apply(preference); }
  private apply(preference: ThemePreference) { document.documentElement.dataset['theme'] = preference === 'system' ? (this.media.matches ? 'dark' : 'light') : preference; }
  private readPreference(): ThemePreference { const saved = localStorage.getItem('rk-theme'); return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system'; }
}
