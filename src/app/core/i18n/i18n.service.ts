import { Injectable, signal } from '@angular/core';

export type SiteLanguage = 'en-US' | 'zh-CN' | 'ja-JP';
type Dictionary = Record<string, string>;
const fallback: Dictionary = { products: 'Products', documentation: 'Documentation', downloads: 'Downloads', releases: 'Releases', about: 'About', search: 'Search', language: 'Language', theme: 'Theme', system: 'System', light: 'Light', dark: 'Dark', getStarted: 'Explore documentation', viewProduct: 'Explore RelaxKonOS' };

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly language = signal<SiteLanguage>(this.detectLanguage());
  readonly messages = signal<Dictionary>(fallback);
  async initialize() { await this.load(this.language()); }
  async setLanguage(language: SiteLanguage) { localStorage.setItem('rk-language', language); this.language.set(language); await this.load(language); }
  t(key: string) { return this.messages()[key] ?? fallback[key] ?? key; }
  private async load(language: SiteLanguage) {
    try { const response = await fetch(`assets/i18n/${language}.json`); this.messages.set({ ...fallback, ...(await response.json() as Dictionary) }); } catch { this.messages.set(fallback); }
  }
  private detectLanguage(): SiteLanguage { const saved = localStorage.getItem('rk-language'); if (saved === 'en-US' || saved === 'zh-CN' || saved === 'ja-JP') return saved; const browser = navigator.language.toLowerCase(); return browser.startsWith('zh') ? 'zh-CN' : browser.startsWith('ja') ? 'ja-JP' : 'en-US'; }
}
