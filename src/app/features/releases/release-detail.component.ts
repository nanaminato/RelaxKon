import { Component, computed, inject, signal } from '@angular/core';
import { LocalizedDatePipe } from '../../core/pipes/localized-date.pipe';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ContentApiService } from '../../core/api/content-api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ReleaseDetails } from '../../core/models/content.models';
import { MarkdownService } from '../../core/services/markdown.service';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  imports: [LocalizedDatePipe, RouterLink],
  template: `
    <section class="section">
      <div class="container narrow">
        <a class="back" routerLink="/releases">← {{ i18n.t('releases.backToList') }}</a>

        @if (loading()) {
          <div class="skeleton" style="height: 260px; margin-top: 1.5rem"></div>
        } @else if (release(); as item) {
          <header class="release__head">
            <p class="eyebrow">{{ i18n.t('releases.title') }}</p>
            <h1>{{ item.title }}</h1>
            <div class="release__meta">
              <span class="mono badge">{{ item.version }}</span>
              @if (item.isPrerelease) { <span class="badge badge--warning">{{ i18n.t('releases.prerelease') }}</span> }
              <time class="muted small">{{ item.releaseDate | rkDate: 'long' : i18n.language() }}</time>
            </div>
            <p class="lead">{{ item.summary }}</p>
          </header>

          @if (item.highlights.length) {
            <section class="highlights">
              <h2>{{ i18n.t('releases.highlights') }}</h2>
              <ul>
                @for (highlight of item.highlights; track highlight) {
                  <li>{{ highlight }}</li>
                }
              </ul>
            </section>
          }

          <article class="prose" [innerHTML]="html()"></article>
        } @else {
          <div class="notice notice--warning" style="margin-top: 1.5rem">
            <div>
              <strong>{{ i18n.t('common.error') }}</strong>
              <p class="mb-0">{{ i18n.t('docs.notFoundHint') }}</p>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .narrow { max-width: 860px; }
      .back { display: inline-block; font-size: .9rem; font-weight: 620; }
      .release__head { margin-top: 1.5rem; }
      .release__head h1 { margin-bottom: .8rem; }
      .release__meta { display: flex; flex-wrap: wrap; align-items: center; gap: .6rem; margin-bottom: 1rem; }
      .highlights {
        margin: 2rem 0;
        padding: 1.2rem 1.4rem;
        border: 1px solid var(--rk-border);
        border-left: 3px solid var(--rk-primary);
        border-radius: var(--rk-radius);
        background: var(--rk-surface-secondary);
      }
      .highlights h2 { margin: 0 0 .6rem; font-size: .95rem; letter-spacing: .06em; text-transform: uppercase; color: var(--rk-text-secondary); }
      .highlights ul { margin: 0; padding-left: 1.2rem; }
      .highlights li { color: var(--rk-text-secondary); margin: .3rem 0; }
    `,
  ],
})
export class ReleaseDetailComponent {
  readonly i18n = inject(I18nService);
  private readonly api = inject(ContentApiService);
  private readonly markdown = inject(MarkdownService);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(true);
  readonly release = signal<ReleaseDetails | null>(null);

  readonly html = computed(() => {
    const item = this.release();
    if (!item) return '';
    // The API returns the full Markdown body; the H1 is already rendered above.
    const body = item.content.replace(/^#\s+.+$/m, '');
    return this.markdown.render(body, { copy: this.i18n.t('common.copy'), copied: this.i18n.t('common.copied') });
  });

  constructor() {
    const version = this.route.snapshot.paramMap.get('version') ?? '';
    const seo = inject(SeoService);

    this.api
      .release(version)
      .pipe(catchError(() => of<ReleaseDetails | null>(null)))
      .subscribe(item => {
        this.release.set(item);
        this.loading.set(false);
        seo.apply({
          title: item ? `${item.title} — RelaxKon Releases` : 'Release — RelaxKon',
          description: item?.summary,
          path: `/releases/${version}`,
        });
      });
  }
}
