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
  templateUrl: './docs.component.html',
  styleUrl: './docs.component.scss',
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
