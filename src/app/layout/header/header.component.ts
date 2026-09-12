import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { I18nService, SiteLanguage } from '../../core/i18n/i18n.service';
import { ThemePreference, ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-header', imports: [RouterLink, RouterLinkActive, FormsModule],
  template: `
    <header class="site-header"><div class="header-inner">
      <a class="brand" routerLink="/" (click)="open.set(false)">RelaxKon<span>OS</span></a>
      <button class="menu" (click)="open.set(!open())" aria-label="Toggle navigation">☰</button>
      <nav [class.open]="open()" aria-label="Primary navigation">
        <a routerLink="/products" routerLinkActive="active">{{ i18n.t('products') }}</a>
        <a routerLink="/docs" routerLinkActive="active">{{ i18n.t('documentation') }}</a>
        <a routerLink="/downloads" routerLinkActive="active">{{ i18n.t('downloads') }}</a>
        <a routerLink="/releases" routerLinkActive="active">{{ i18n.t('releases') }}</a>
        <a routerLink="/about" routerLinkActive="active">{{ i18n.t('about') }}</a>
        <label><span class="sr-only">{{ i18n.t('language') }}</span><select [ngModel]="i18n.language()" (ngModelChange)="setLanguage($event)"><option value="en-US">EN</option><option value="zh-CN">中文</option><option value="ja-JP">日本語</option></select></label>
        <label><span class="sr-only">{{ i18n.t('theme') }}</span><select [ngModel]="theme.preference()" (ngModelChange)="setTheme($event)"><option value="system">{{ i18n.t('system') }}</option><option value="light">{{ i18n.t('light') }}</option><option value="dark">{{ i18n.t('dark') }}</option></select></label>
      </nav>
    </div></header>`,
  styles: `.site-header{position:sticky;top:0;z-index:10;border-bottom:1px solid var(--rk-border);background:color-mix(in srgb,var(--rk-bg) 92%,transparent);backdrop-filter:blur(10px)}.header-inner{height:64px;width:min(1120px,calc(100% - 2rem));margin:auto;display:flex;align-items:center;gap:1.6rem}.brand{font-weight:850;letter-spacing:-.06em;font-size:1.22rem;color:var(--rk-text)}.brand span{color:var(--rk-primary)}nav{display:flex;align-items:center;gap:1.1rem;margin-left:auto}nav a{font-size:.92rem;color:var(--rk-text-secondary)}nav a.active,nav a:hover{color:var(--rk-primary)}select{border:1px solid var(--rk-border);background:var(--rk-surface);color:var(--rk-text);border-radius:.35rem;padding:.3rem}.menu{display:none;margin-left:auto;border:0;background:none;color:var(--rk-text);font-size:1.2rem}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}@media(max-width:820px){.menu{display:block}nav{display:none;position:absolute;top:64px;left:0;right:0;padding:1rem;background:var(--rk-surface);border-bottom:1px solid var(--rk-border);box-shadow:var(--rk-shadow);align-items:stretch;flex-direction:column;margin:0}nav.open{display:flex}nav label{display:block}}`,
})
export class HeaderComponent {
  readonly i18n = inject(I18nService); readonly theme = inject(ThemeService); readonly open = signal(false);
  setLanguage(value: SiteLanguage) { void this.i18n.setLanguage(value); }
  setTheme(value: ThemePreference) { this.theme.set(value); }
}
