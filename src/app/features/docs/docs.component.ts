import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DocumentationApiService } from '../../core/api/documentation-api.service';
import { I18nService, SITE_LANGUAGES } from '../../core/i18n/i18n.service';
import { DocumentContent, DocumentHeading, LanguageInfo, NavigationNode, SearchResult } from '../../core/models/content.models';
import { MarkdownService } from '../../core/services/markdown.service';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  imports: [RouterLink, FormsModule],
  template: `
    <div class="docs" [class.docs--drawer]="drawerOpen()">
      <!-- Sidebar -->
      <aside class="sidebar" [class.is-open]="drawerOpen()" aria-label="Documentation navigation">
        <div class="sidebar__head">
          <a class="sidebar__title" routerLink="/docs">{{ i18n.t('docs.title') }}</a>
          <button class="sidebar__close" type="button" (click)="drawerOpen.set(false)" [attr.aria-label]="i18n.t('docs.closeDrawer')">✕</button>
        </div>

        <!-- ngModel (not [value]) so both switchers re-sync once the options exist;
             a plain [value] binding is written before @for renders the <option>s. -->
        <div class="switchers">
          <label>
            <span>{{ i18n.t('docs.languageLabel') }}</span>
            <select [ngModel]="language()" (ngModelChange)="switchLanguage($event)">
              @for (item of languages(); track item.code) {
                <option [ngValue]="item.code">{{ item.name }}</option>
              }
            </select>
          </label>
          <label>
            <span>{{ i18n.t('docs.versionLabel') }}</span>
            <select [ngModel]="version()" (ngModelChange)="switchVersion($event)">
              @for (item of versions(); track item) {
                <option [ngValue]="item">{{ item }}</option>
              }
            </select>
          </label>
        </div>

        <div class="sidebar__search">
          <input
            type="search"
            [placeholder]="i18n.t('docs.searchPlaceholder')"
            [ngModel]="query()"
            (ngModelChange)="onQuery($event)"
            (keyup.enter)="runSearch()"
            autocomplete="off"
          />
          @if (searching()) { <p class="sidebar__hint">{{ i18n.t('docs.searching') }}</p> }
          @if (results().length) {
            <ul class="sidebar__results">
              @for (item of results(); track item.slug) {
                <li>
                  <a [routerLink]="docLink(item.slug)">
                    <strong>{{ item.title }}</strong>
                    <small>{{ item.snippet }}</small>
                  </a>
                </li>
              }
            </ul>
          } @else if (query().trim().length > 1 && !searching()) {
            <p class="sidebar__hint">{{ i18n.t('docs.noResults') }}</p>
          }
        </div>

        @if (loading()) {
          <div class="sidebar__skeleton">
            @for (row of [1, 2, 3, 4, 5, 6]; track row) {
              <span class="skeleton" style="height: 14px"></span>
            }
          </div>
        } @else {
          <nav class="sidebar__nav">
            @for (group of navigation(); track group.title) {
              <section>
                <h3>{{ group.title }}</h3>
                @for (item of group.children; track item.slug) {
                  <a [class.is-current]="item.slug === document()?.slug" [routerLink]="docLink(item.slug!)">{{ item.title }}</a>
                }
              </section>
            }
          </nav>
        }
      </aside>

      @if (drawerOpen()) {
        <div class="docs__scrim" (click)="drawerOpen.set(false)" aria-hidden="true"></div>
      }

      <!-- Content -->
      <main class="content">
        <div class="content__bar">
          <button class="icon-btn" type="button" (click)="drawerOpen.set(true)" [attr.aria-label]="i18n.t('docs.openDrawer')">☰</button>
          <span class="mono content__crumb">{{ language() }} · {{ version() }}</span>
          <button class="toc-toggle" type="button" (click)="tocOpen.set(!tocOpen())" [attr.aria-expanded]="tocOpen()">
            {{ i18n.t('docs.onThisPage') }}
          </button>
        </div>

        @if (loading()) {
          <div class="content__loading">
            <span class="skeleton" style="height: 34px; width: 55%"></span>
            <span class="skeleton" style="height: 16px"></span>
            <span class="skeleton" style="height: 16px; width: 88%"></span>
            <span class="skeleton" style="height: 16px; width: 72%"></span>
            <span class="skeleton" style="height: 220px"></span>
          </div>
        } @else if (!document()) {
          <div class="notice notice--warning">
            <div>
              <strong>{{ i18n.t('docs.notFound') }}</strong>
              <p class="mb-0">{{ i18n.t('docs.notFoundHint') }}</p>
            </div>
          </div>
        } @else if (document(); as item) {
          @if (item.isFallback) {
            <p class="notice mt-0">{{ i18n.t('docs.fallbackNotice', { language: fallbackLanguageName() }) }}</p>
          }

          <article #article class="prose" [innerHTML]="html()"></article>

          <nav class="pager">
            @if (item.previous) {
              <a class="pager__link" [routerLink]="docLink(item.previous.slug)">
                <small>{{ i18n.t('docs.previousPage') }}</small>
                <strong>← {{ item.previous.title }}</strong>
              </a>
            } @else { <span></span> }
            @if (item.next) {
              <a class="pager__link pager__link--next" [routerLink]="docLink(item.next.slug)">
                <small>{{ i18n.t('docs.nextPage') }}</small>
                <strong>{{ item.next.title }} →</strong>
              </a>
            }
          </nav>
        }
      </main>

      <!-- Table of contents -->
      @if (headings().length) {
        <aside class="toc" [class.is-open]="tocOpen()">
          <h2>{{ i18n.t('docs.onThisPage') }}</h2>
          <nav>
            @for (heading of headings(); track heading.id) {
              <a
                [class.is-active]="activeHeading() === heading.id"
                [class.level-3]="heading.level === 3"
                [href]="'#' + heading.id"
                (click)="focusHeading($event, heading.id)"
              >{{ heading.text }}</a>
            }
          </nav>
        </aside>
      }
    </div>
  `,
  styles: [
    `
      .docs {
        display: grid;
        grid-template-columns: 268px minmax(0, 1fr) 216px;
        gap: clamp(1.25rem, 3vw, 2.75rem);
        width: min(1440px, 100% - var(--rk-gutter) * 2);
        margin-inline: auto;
        padding-block: 2rem 4rem;
        align-items: start;
      }
      .sidebar { position: sticky; top: calc(var(--rk-header-height) + 1.25rem); max-height: calc(100vh - var(--rk-header-height) - 3rem); overflow-y: auto; padding-right: .5rem; }
      .sidebar__head { display: flex; align-items: center; justify-content: space-between; gap: .5rem; margin-bottom: .9rem; }
      .sidebar__title { color: var(--rk-text); font-size: 1.02rem; font-weight: 780; letter-spacing: -.02em; }
      .sidebar__close { display: none; font-size: 1rem; color: var(--rk-text-muted); }
      .switchers { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; margin-bottom: .9rem; }
      .switchers label { display: grid; gap: .25rem; }
      .switchers span { color: var(--rk-text-muted); font-size: .68rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
      .switchers select {
        width: 100%;
        padding: .35rem .45rem;
        border: 1px solid var(--rk-border);
        border-radius: var(--rk-radius-sm);
        background: var(--rk-surface);
        color: var(--rk-text);
        font-size: .82rem;
      }
      .sidebar__search input {
        width: 100%;
        padding: .5rem .65rem;
        border: 1px solid var(--rk-border);
        border-radius: var(--rk-radius);
        background: var(--rk-surface);
        font-size: .88rem;
      }
      .sidebar__hint { margin: .5rem .15rem 0; color: var(--rk-text-muted); font-size: .8rem; }
      .sidebar__results { display: grid; gap: .15rem; margin: .55rem 0 0; padding: .35rem; list-style: none; border: 1px solid var(--rk-border); border-radius: var(--rk-radius); background: var(--rk-surface); }
      .sidebar__results a { display: grid; gap: .1rem; padding: .45rem .5rem; border-radius: var(--rk-radius-sm); }
      .sidebar__results a:hover { background: var(--rk-surface-secondary); }
      .sidebar__results strong { color: var(--rk-text); font-size: .87rem; }
      .sidebar__results small { overflow: hidden; color: var(--rk-text-muted); font-size: .76rem; text-overflow: ellipsis; white-space: nowrap; }
      .sidebar__skeleton { display: grid; gap: .6rem; margin-top: 1.2rem; }
      .sidebar__nav { display: grid; gap: 1.3rem; margin-top: 1.3rem; }
      .sidebar__nav h3 { margin-bottom: .45rem; color: var(--rk-text-muted); font-size: .72rem; font-weight: 760; letter-spacing: .1em; text-transform: uppercase; }
      .sidebar__nav a {
        display: block;
        padding: .34rem .55rem;
        border-radius: var(--rk-radius-sm);
        color: var(--rk-text-secondary);
        font-size: .89rem;
        border-left: 2px solid transparent;
      }
      .sidebar__nav a:hover { background: var(--rk-surface-secondary); color: var(--rk-text); }
      .sidebar__nav a.is-current { border-left-color: var(--rk-primary); background: var(--rk-primary-soft); color: var(--rk-primary); font-weight: 650; }

      .content { min-width: 0; }
      .content__bar { display: none; align-items: center; gap: .75rem; margin-bottom: 1.1rem; }
      .content__crumb { color: var(--rk-text-muted); font-size: .76rem; }
      .icon-btn { display: grid; place-items: center; width: 38px; height: 38px; border: 1px solid var(--rk-border); border-radius: var(--rk-radius); background: var(--rk-surface); }
      .toc-toggle { margin-left: auto; padding: .4rem .7rem; border: 1px solid var(--rk-border); border-radius: var(--rk-radius-pill); background: var(--rk-surface); color: var(--rk-text-secondary); font-size: .82rem; }
      .content__loading { display: grid; gap: .8rem; }

      .pager { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 3.5rem; padding-top: 1.75rem; border-top: 1px solid var(--rk-border); }
      .pager__link { display: grid; gap: .2rem; padding: .85rem 1rem; border: 1px solid var(--rk-border); border-radius: var(--rk-radius); color: inherit; transition: border-color var(--rk-transition), box-shadow var(--rk-transition); }
      .pager__link:hover { border-color: var(--rk-primary); box-shadow: var(--rk-shadow-sm); }
      .pager__link small { color: var(--rk-text-muted); font-size: .72rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
      .pager__link strong { font-size: .93rem; font-weight: 650; }
      .pager__link--next { text-align: right; }

      .toc { position: sticky; top: calc(var(--rk-header-height) + 1.25rem); max-height: calc(100vh - var(--rk-header-height) - 3rem); overflow-y: auto; padding-left: 1rem; border-left: 1px solid var(--rk-border); }
      .toc h2 { margin-bottom: .6rem; color: var(--rk-text-muted); font-size: .72rem; font-weight: 760; letter-spacing: .1em; text-transform: uppercase; }
      .toc nav { display: grid; gap: .1rem; }
      .toc a { display: block; padding: .25rem 0 .25rem .6rem; border-left: 2px solid transparent; color: var(--rk-text-secondary); font-size: .84rem; line-height: 1.45; }
      .toc a:hover { color: var(--rk-text); }
      .toc a.level-3 { padding-left: 1.35rem; font-size: .8rem; }
      .toc a.is-active { border-left-color: var(--rk-primary); color: var(--rk-primary); font-weight: 620; }

      .docs__scrim { display: none; }

      @media (max-width: 1180px) {
        .docs { grid-template-columns: 250px minmax(0, 1fr); }
        .toc { display: none; grid-column: 1 / -1; position: static; padding: .9rem 1rem; border: 1px solid var(--rk-border); border-radius: var(--rk-radius); background: var(--rk-surface); }
        .toc.is-open { display: block; }
        .content__bar { display: flex; }
      }
      @media (max-width: 900px) {
        .docs { grid-template-columns: minmax(0, 1fr); }
        .sidebar {
          position: fixed;
          top: 0; bottom: 0; left: 0;
          z-index: 120;
          width: min(320px, 86vw);
          max-height: none;
          padding: 1.2rem var(--rk-gutter) 2rem;
          background: var(--rk-bg-elevated);
          box-shadow: var(--rk-shadow-lg);
          transform: translateX(-102%);
          transition: transform var(--rk-transition);
        }
        .sidebar.is-open { transform: translateX(0); }
        .sidebar__close { display: block; }
        .docs__scrim { display: block; position: fixed; inset: 0; z-index: 110; background: var(--rk-overlay); }
      }
    `,
  ],
})
export class DocsComponent {
  readonly i18n = inject(I18nService);
  private readonly api = inject(DocumentationApiService);
  private readonly router = inject(Router);
  private readonly markdown = inject(MarkdownService);
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly navigation = signal<NavigationNode[]>([]);
  readonly document = signal<DocumentContent | null>(null);
  readonly results = signal<SearchResult[]>([]);
  readonly headings = signal<DocumentHeading[]>([]);
  readonly languages = signal<LanguageInfo[]>([]);
  readonly versions = signal<string[]>(['latest']);
  readonly language = signal('en-US');
  readonly version = signal('latest');
  readonly query = signal('');
  readonly activeHeading = signal('');
  readonly loading = signal(true);
  readonly searching = signal(false);
  readonly drawerOpen = signal(false);
  readonly tocOpen = signal(false);

  private readonly copyLabels = computed(() => ({
    copy: this.i18n.t('common.copy'),
    copied: this.i18n.t('common.copied'),
  }));

  readonly html = computed(() => {
    const item = this.document();
    return item ? this.markdown.render(item.content, this.copyLabels()) : '';
  });

  private observer: IntersectionObserver | null = null;

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.load());

    this.api.getLanguages().subscribe({
      next: languages => this.languages.set(languages),
      error: () => this.languages.set(SITE_LANGUAGES.map(item => ({ code: item.code, name: item.label }))),
    });

    this.load();
  }

  docLink(slug: string): unknown[] {
    return ['/docs', this.language(), this.version(), ...slug.split('/')];
  }

  fallbackLanguageName(): string {
    const code = this.document()?.language ?? 'en-US';
    return this.languages().find(item => item.code === code)?.name ?? code;
  }

  switchLanguage(language: string): void {
    void this.router.navigate(['/docs', language, this.version(), ...this.slugParts()]);
  }

  switchVersion(version: string): void {
    void this.router.navigate(['/docs', this.language(), version, ...this.slugParts()]);
  }

  onQuery(value: string): void {
    this.query.set(value);
    if (value.trim().length < 2) this.results.set([]);
  }

  runSearch(): void {
    const value = this.query().trim();
    if (value.length < 2) return;
    this.searching.set(true);
    this.api.search(value, this.language(), this.version()).subscribe({
      next: results => {
        this.results.set(results);
        this.searching.set(false);
      },
      error: () => {
        this.results.set([]);
        this.searching.set(false);
      },
    });
  }

  focusHeading(event: MouseEvent, id: string): void {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
    this.activeHeading.set(id);
  }

  // ------------------------------------------------------------ loading ----

  private load(): void {
    const { language, version, slug } = this.context();
    this.language.set(language);
    this.version.set(version);
    this.loading.set(true);
    this.results.set([]);
    this.query.set('');
    this.drawerOpen.set(false);

    this.api.getVersions(language).subscribe({
      next: versions => this.versions.set(versions.length ? versions : ['latest']),
      error: () => this.versions.set(['latest']),
    });

    this.api.getNavigation(language, version).subscribe({
      next: navigation => this.navigation.set(navigation),
      error: () => this.navigation.set([]),
    });

    this.api.getDocument(language, version, slug).subscribe({
      next: document => {
        this.document.set(document);
        this.headings.set(document.headings?.length ? document.headings : this.markdown.headings(document.content));
        this.loading.set(false);
        this.seo.apply({
          title: `${document.title} — RelaxKonOS Documentation — RelaxKon`,
          description: document.description,
          path: this.router.url.split('?')[0],
        });
        setTimeout(() => this.attachInteractions());
      },
      error: () => {
        this.document.set(null);
        this.headings.set([]);
        this.loading.set(false);
      },
    });
  }

  private context(): { language: string; version: string; slug: string } {
    const parts = this.router.url.split('?')[0].split('/').filter(Boolean);
    const language = parts[1] ?? 'en-US';
    const version = parts[2] ?? 'latest';
    const slug = parts.slice(3).join('/') || 'getting-started/introduction';
    return { language, version, slug };
  }

  private slugParts(): string[] {
    return this.slugPartsOf(this.document()?.slug ?? this.context().slug);
  }

  private slugPartsOf(slug: string): string[] {
    return slug.split('/').filter(Boolean);
  }

  // ------------------------------------------------------- interactions ----

  private attachInteractions(): void {
    const article = window.document.querySelector<HTMLElement>('.content .prose');
    if (!article) return;

    article.querySelectorAll<HTMLButtonElement>('button[data-copy]').forEach(button => {
      if (button.dataset['bound']) return;
      button.dataset['bound'] = 'true';
      button.addEventListener('click', () => {
        const code = button.parentElement?.querySelector('code')?.textContent ?? '';
        void navigator.clipboard?.writeText(code).then(() => {
          const original = button.textContent ?? '';
          button.textContent = button.dataset['copied'] ?? 'Copied';
          setTimeout(() => (button.textContent = original), 1600);
        });
      });
    });

    this.observer?.disconnect();
    const targets = article.querySelectorAll<HTMLElement>('h1[id], h2[id], h3[id]');
    if (!targets.length) return;

    this.observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) this.activeHeading.set(visible[0].target.id);
      },
      { rootMargin: '-90px 0px -70% 0px', threshold: [0, 1] },
    );
    targets.forEach(target => this.observer?.observe(target));
  }
}
