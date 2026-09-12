import { Injectable, computed, signal } from '@angular/core';

export type SiteLanguage = 'en-US' | 'zh-CN' | 'ja-JP';

export const SITE_LANGUAGES: readonly { code: SiteLanguage; label: string; short: string }[] = [
  { code: 'en-US', label: 'English', short: 'EN' },
  { code: 'zh-CN', label: '简体中文', short: '中文' },
  { code: 'ja-JP', label: '日本語', short: '日本語' },
];

type Dictionary = Record<string, string>;
type NestedDictionary = Record<string, unknown>;

const STORAGE_KEY = 'rk-language';

/**
 * Minimal runtime i18n service.
 *
 * Dictionaries live in `assets/i18n/<code>.json` as nested objects and are
 * flattened to dotted keys so templates can call `t('home.hero.title')`.
 * Switching language never reloads the page and the choice is remembered in
 * LocalStorage, falling back to the browser language and finally to en-US.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly languages = SITE_LANGUAGES;
  readonly language = signal<SiteLanguage>(this.detectLanguage());
  readonly messages = signal<Dictionary>({});
  readonly ready = signal(false);
  readonly current = computed(() => SITE_LANGUAGES.find(item => item.code === this.language()) ?? SITE_LANGUAGES[0]);

  async initialize(): Promise<void> {
    await this.load(this.language());
  }

  async setLanguage(language: SiteLanguage): Promise<void> {
    if (language === this.language() && this.ready()) return;
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    this.language.set(language);
    await this.load(language);
  }

  /** Translates a dotted key with optional `{placeholder}` interpolation. */
  t(key: string, params?: Record<string, string | number>): string {
    const value = this.messages()[key] ?? key;
    if (!params) return value;
    return Object.entries(params).reduce(
      (text, [name, replacement]) => text.replaceAll(`{${name}}`, String(replacement)),
      value,
    );
  }

  private async load(language: SiteLanguage): Promise<void> {
    try {
      const response = await fetch(`assets/i18n/${language}.json`, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.messages.set(flatten((await response.json()) as NestedDictionary));
    } catch {
      if (language !== 'en-US') {
        await this.load('en-US');
        return;
      }
      this.messages.set({});
    } finally {
      document.documentElement.lang = language;
      this.ready.set(true);
    }
  }

  private detectLanguage(): SiteLanguage {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isSiteLanguage(saved)) return saved;
    const browser = (navigator.language ?? 'en').toLowerCase();
    if (browser.startsWith('zh')) return 'zh-CN';
    if (browser.startsWith('ja')) return 'ja-JP';
    return 'en-US';
  }
}

function isSiteLanguage(value: string | null): value is SiteLanguage {
  return value === 'en-US' || value === 'zh-CN' || value === 'ja-JP';
}

/** Flattens `{ a: { b: 'x' } }` into `{ 'a.b': 'x' }`. */
function flatten(source: NestedDictionary, prefix = '', target: Dictionary = {}): Dictionary {
  for (const [key, value] of Object.entries(source)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flatten(value as NestedDictionary, path, target);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const itemPath = `${path}.${index}`;
        if (item && typeof item === 'object') flatten(item as NestedDictionary, itemPath, target);
        else (target[itemPath] = String(item));
      });
    } else {
      target[path] = value == null ? '' : String(value);
    }
  }
  return target;
}
