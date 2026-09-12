import { Component, DestroyRef, ElementRef, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { I18nService, SITE_LANGUAGES, SiteLanguage } from '../../core/i18n/i18n.service';
import { ThemePreference, ThemeService } from '../../core/theme/theme.service';
import { SearchOverlayComponent } from '../search/search-overlay.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, FormsModule, SearchOverlayComponent],
  template: `
    <header class="site-header" [class.is-scrolled]="scrolled()">
      <div class="header-inner">
        <a class="brand" routerLink="/" (click)="closeAll()" aria-label="RelaxKon">
          <span class="brand__mark" aria-hidden="true">R</span>
          <span class="brand__text">Relax<span>Kon</span></span>
        </a>

        <button class="icon-btn menu-btn" type="button" (click)="toggleMobile()" [attr.aria-expanded]="mobileOpen()" [attr.aria-label]="i18n.t('nav.menu')">
          <span class="bars" aria-hidden="true"></span>
        </button>

        <nav class="nav" [class.is-open]="mobileOpen()">
          <div class="nav__item nav__item--menu">
            <button type="button" class="nav__link nav__link--button" [attr.aria-expanded]="productsOpen()" (click)="toggleProducts($event)">
              {{ i18n.t('nav.products') }}<span class="caret" aria-hidden="true"></span>
            </button>
            @if (productsOpen()) {
              <div class="dropdown" role="menu">
                <a class="dropdown__item" routerLink="/products/relaxkonos" role="menuitem" (click)="closeAll()">
                  <span class="dropdown__dot" aria-hidden="true"></span>
                  <span>
                    <strong>RelaxKonOS</strong>
                    <small>{{ i18n.t('products.cardText') }}</small>
                  </span>
                </a>
                <div class="dropdown__footer">
                  <a routerLink="/products" (click)="closeAll()">{{ i18n.t('nav.allProducts') }} →</a>
                </div>
              </div>
            }
          </div>
          <a class="nav__link" routerLink="/docs" routerLinkActive="is-active" (click)="closeAll()">{{ i18n.t('nav.documentation') }}</a>
          <a class="nav__link" routerLink="/downloads" routerLinkActive="is-active" (click)="closeAll()">{{ i18n.t('nav.downloads') }}</a>
          <a class="nav__link" routerLink="/releases" routerLinkActive="is-active" (click)="closeAll()">{{ i18n.t('nav.releases') }}</a>
          <a class="nav__link" routerLink="/about" routerLinkActive="is-active" (click)="closeAll()">{{ i18n.t('nav.about') }}</a>

          <div class="nav__controls">
            <button class="search-trigger" type="button" (click)="openSearch()">
              <span aria-hidden="true">⌕</span>
              <span>{{ i18n.t('nav.search') }}</span>
              <kbd aria-hidden="true">/</kbd>
            </button>
            <div class="segmented" role="group" [attr.aria-label]="i18n.t('theme.label')">
              @for (option of themeOptions; track option.value) {
                <button type="button" [class.is-active]="theme.preference() === option.value" (click)="setTheme(option.value)" [attr.aria-pressed]="theme.preference() === option.value" [title]="i18n.t(option.label)">
                  <span aria-hidden="true">{{ option.glyph }}</span>
                </button>
              }
            </div>
            <label class="lang">
              <span class="sr-only">{{ i18n.t('nav.language') }}</span>
              <!-- ngModel (not [value]) so the control re-syncs once the options exist;
                   a plain [value] binding is written before @for renders the <option>s. -->
              <select [ngModel]="i18n.language()" (ngModelChange)="setLanguage($event)">
                @for (option of languages; track option.code) {
                  <option [ngValue]="option.code">{{ option.label }}</option>
                }
              </select>
            </label>
          </div>
        </nav>
      </div>
    </header>

    <app-search-overlay [open]="searchOpen()" (closed)="searchOpen.set(false)" />
  `,
  styles: [
    `
      .site-header {
        position: sticky;
        top: 0;
        z-index: 60;
        border-bottom: 1px solid transparent;
        background: color-mix(in srgb, var(--rk-bg) 86%, transparent);
        backdrop-filter: saturate(150%) blur(14px);
        transition: border-color var(--rk-transition), background var(--rk-transition), box-shadow var(--rk-transition);
      }
      .site-header.is-scrolled { border-bottom-color: var(--rk-border); box-shadow: var(--rk-shadow-xs); }
      .header-inner {
        display: flex;
        align-items: center;
        gap: 1.75rem;
        width: min(var(--rk-container), 100% - var(--rk-gutter) * 2);
        height: var(--rk-header-height);
        margin-inline: auto;
      }
      .brand { display: inline-flex; align-items: center; gap: .6rem; color: var(--rk-text); }
      .brand__mark {
        display: grid; place-items: center;
        width: 30px; height: 30px;
        border-radius: 9px;
        background: linear-gradient(140deg, var(--rk-primary), var(--rk-accent));
        color: #fff;
        font-weight: 850;
        font-size: .95rem;
        letter-spacing: -.03em;
      }
      .brand__text { font-size: 1.16rem; font-weight: 800; letter-spacing: -.05em; }
      .brand__text span { color: var(--rk-primary); font-weight: 700; }
      .nav { display: flex; align-items: center; gap: .25rem; margin-left: auto; }
      .nav__item { position: relative; }
      .nav__link {
        display: inline-flex; align-items: center; gap: .3rem;
        padding: .48rem .7rem;
        border-radius: var(--rk-radius-sm);
        color: var(--rk-text-secondary);
        font-size: .92rem;
        font-weight: 620;
        white-space: nowrap;
      }
      .nav__link:hover, .nav__link.is-active { color: var(--rk-text); background: var(--rk-surface-secondary); }
      .nav__link--button { font: inherit; }
      .caret { width: 7px; height: 7px; border-right: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor; transform: rotate(45deg) translateY(-2px); }
      .dropdown {
        position: absolute;
        top: calc(100% + 10px);
        left: 0;
        width: 320px;
        padding: .5rem;
        border: 1px solid var(--rk-border);
        border-radius: var(--rk-radius-lg);
        background: var(--rk-bg-elevated);
        box-shadow: var(--rk-shadow-lg);
      }
      .dropdown__item { display: flex; gap: .7rem; padding: .7rem; border-radius: var(--rk-radius); }
      .dropdown__item:hover { background: var(--rk-surface-secondary); }
      .dropdown__item strong { display: block; color: var(--rk-text); font-size: .95rem; }
      .dropdown__item small { display: block; color: var(--rk-text-secondary); font-size: .82rem; line-height: 1.5; }
      .dropdown__dot { flex: none; width: 8px; height: 8px; margin-top: .45rem; border-radius: 50%; background: var(--rk-primary); }
      .dropdown__footer { padding: .5rem .7rem .35rem; border-top: 1px solid var(--rk-border); margin-top: .35rem; font-size: .86rem; }
      .nav__controls { display: flex; align-items: center; gap: .6rem; margin-left: 1rem; }
      .search-trigger {
        display: inline-flex; align-items: center; gap: .5rem;
        padding: .42rem .7rem;
        border: 1px solid var(--rk-border);
        border-radius: var(--rk-radius-pill);
        background: var(--rk-surface);
        color: var(--rk-text-muted);
        font-size: .86rem;
      }
      .search-trigger:hover { border-color: var(--rk-border-strong); color: var(--rk-text); }
      .search-trigger kbd {
        padding: .05rem .35rem;
        border: 1px solid var(--rk-border);
        border-radius: 4px;
        background: var(--rk-surface-secondary);
        font-family: var(--rk-font-mono);
        font-size: .72rem;
      }
      .segmented { display: inline-flex; padding: 2px; border: 1px solid var(--rk-border); border-radius: var(--rk-radius-pill); background: var(--rk-surface-secondary); }
      .segmented button {
        width: 30px; height: 26px;
        border-radius: var(--rk-radius-pill);
        color: var(--rk-text-muted);
        font-size: .82rem;
        line-height: 1;
      }
      .segmented button:hover { color: var(--rk-text); }
      .segmented button.is-active { background: var(--rk-surface); color: var(--rk-primary); box-shadow: var(--rk-shadow-xs); }
      .lang select {
        padding: .4rem .6rem;
        border: 1px solid var(--rk-border);
        border-radius: var(--rk-radius-pill);
        background: var(--rk-surface);
        color: var(--rk-text-secondary);
        font-size: .86rem;
      }
      .icon-btn { display: none; }
      .menu-btn {
        margin-left: auto;
        width: 40px; height: 40px;
        border: 1px solid var(--rk-border);
        border-radius: var(--rk-radius);
        background: var(--rk-surface);
      }
      .bars, .bars::before, .bars::after {
        display: block; width: 17px; height: 1.6px;
        margin-inline: auto;
        background: var(--rk-text);
        border-radius: 2px;
      }
      .bars { position: relative; }
      .bars::before, .bars::after { content: ''; position: absolute; left: 0; }
      .bars::before { top: -5px; }
      .bars::after { top: 5px; }

      @media (max-width: 1080px) {
        .nav__controls { margin-left: .5rem; }
        .search-trigger span:not(:first-child), .search-trigger kbd { display: none; }
      }
      @media (max-width: 900px) {
        .icon-btn.menu-btn { display: grid; place-items: center; }
        .nav {
          position: absolute;
          top: var(--rk-header-height);
          left: 0; right: 0;
          flex-direction: column;
          align-items: stretch;
          gap: .15rem;
          margin: 0;
          padding: .9rem var(--rk-gutter) 1.2rem;
          border-bottom: 1px solid var(--rk-border);
          background: var(--rk-bg-elevated);
          box-shadow: var(--rk-shadow-md);
          display: none;
        }
        .nav.is-open { display: flex; }
        .nav__link { padding: .7rem .5rem; font-size: 1rem; }
        .dropdown { position: static; width: auto; margin: .4rem 0 .6rem; box-shadow: none; }
        .nav__controls { flex-wrap: wrap; gap: .8rem; margin: 1rem 0 0; }
        .search-trigger { flex: 1 1 100%; }
        .lang select { width: 100%; }
      }
    `,
  ],
})
export class HeaderComponent {
  readonly i18n = inject(I18nService);
  readonly theme = inject(ThemeService);
  readonly languages = SITE_LANGUAGES;
  readonly themeOptions: { value: ThemePreference; glyph: string; label: string }[] = [
    { value: 'system', glyph: '◐', label: 'theme.system' },
    { value: 'light', glyph: '☀', label: 'theme.light' },
    { value: 'dark', glyph: '☾', label: 'theme.dark' },
  ];

  readonly productsOpen = signal(false);
  readonly mobileOpen = signal(false);
  readonly searchOpen = signal(false);
  readonly scrolled = signal(false);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.productsOpen()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) this.productsOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAll();
  }

  @HostListener('document:keydown', ['$event'])
  onShortcut(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
    if (event.key === '/' && !typing && !this.searchOpen()) {
      event.preventDefault();
      this.searchOpen.set(true);
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  toggleProducts(event: MouseEvent): void {
    event.stopPropagation();
    this.productsOpen.update(value => !value);
  }

  toggleMobile(): void {
    this.mobileOpen.update(value => !value);
  }

  openSearch(): void {
    this.searchOpen.set(true);
    this.closeAll();
  }

  closeAll(): void {
    this.productsOpen.set(false);
    this.mobileOpen.set(false);
  }

  setTheme(value: ThemePreference): void {
    this.theme.set(value);
  }

  setLanguage(value: string): void {
    void this.i18n.setLanguage(value as SiteLanguage);
  }
}
