import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DocumentationApiService } from '../../core/api/documentation-api.service';
import { I18nService, SITE_LANGUAGES } from '../../core/i18n/i18n.service';
import { DocumentContent, DocumentHeading, LanguageInfo, NavigationNode, SearchResult } from '../../core/models/content.models';
import { MarkdownService } from '../../core/services/markdown.service';
import { SeoService } from '../../core/seo/seo.service';

/** Mirrors `DocumentService.DefaultLanguage`: a fallback article is always English. */
const DEFAULT_DOCUMENT_LANGUAGE = 'en-US';

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
  private readonly injector = inject(Injector);
  private readonly articleRef = viewChild<ElementRef<HTMLElement>>('article');

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

  /**
   * Language the article body is really written in. The response echoes the
   * requested language, so an untranslated page — one the server served from the
   * default language — has to be reported as that default instead.
   */
  readonly articleLanguage = computed(() => {
    const item = this.document();
    if (!item) return null;
    return item.isFallback ? DEFAULT_DOCUMENT_LANGUAGE : item.language;
  });

  private observer: IntersectionObserver | null = null;

  /**
   * Versions change per language and navigation per language+version, so both are
   * kept for the session: browsing from article to article used to refetch them
   * even though only the slug had changed. Content changes ship with a deploy,
   * which reloads the app.
   */
  private readonly versionsCache = new Map<string, string[]>();
  private readonly navigationCache = new Map<string, NavigationNode[]>();

  /**
   * Bumped by every `load()`. A response that no longer belongs to the newest
   * navigation is dropped instead of overwriting newer state — clicking through
   * the pager quickly used to let a slow article win the race.
   */
  private requestGeneration = 0;

  constructor() {
    this.destroyRef.onDestroy(() => this.i18n.setContentLanguage(null));

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
    const generation = ++this.requestGeneration;
    this.language.set(language);
    this.version.set(version);
    // The route already names the intended article language; the response below
    // corrects this when the server substitutes the default language instead.
    this.i18n.setContentLanguage(language);
    this.loading.set(true);
    this.results.set([]);
    this.query.set('');
    this.drawerOpen.set(false);

    this.loadVersions(language, generation);
    this.loadNavigation(language, version, generation);

    this.api.getDocument(language, version, slug).subscribe({
      next: document => {
        if (generation !== this.requestGeneration) return;
        this.document.set(document);
        this.i18n.setContentLanguage(this.articleLanguage());
        this.headings.set(document.headings?.length ? document.headings : this.markdown.headings(document.content));
        this.loading.set(false);
        this.seo.apply({
          titleKey: 'pageTitles.document',
          titleParams: { title: document.title },
          description: document.description,
          path: this.router.url.split('?')[0],
        });
        // The copy buttons and the scroll spy need the rendered article; waiting
        // on a bare timeout silently skipped them whenever the render ran slower.
        afterNextRender(() => this.attachInteractions(), { injector: this.injector });
      },
      error: () => {
        if (generation !== this.requestGeneration) return;
        this.document.set(null);
        this.i18n.setContentLanguage(null);
        this.headings.set([]);
        this.loading.set(false);
      },
    });
  }

  private loadVersions(language: string, generation: number): void {
    const cached = this.versionsCache.get(language);
    if (cached) {
      this.versions.set(cached);
      return;
    }
    this.api.getVersions(language).subscribe({
      next: versions => {
        if (generation !== this.requestGeneration) return;
        const list = versions.length ? versions : ['latest'];
        this.versionsCache.set(language, list);
        this.versions.set(list);
      },
      error: () => {
        if (generation === this.requestGeneration) this.versions.set(['latest']);
      },
    });
  }

  private loadNavigation(language: string, version: string, generation: number): void {
    const key = `${language}/${version}`;
    const cached = this.navigationCache.get(key);
    if (cached) {
      this.navigation.set(cached);
      return;
    }
    this.api.getNavigation(language, version).subscribe({
      next: navigation => {
        if (generation !== this.requestGeneration) return;
        this.navigationCache.set(key, navigation);
        this.navigation.set(navigation);
      },
      error: () => {
        if (generation === this.requestGeneration) this.navigation.set([]);
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
    const article = this.articleRef()?.nativeElement;
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
