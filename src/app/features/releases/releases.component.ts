import { Component, inject, signal } from '@angular/core';
import { LocalizedDatePipe } from '../../core/pipes/localized-date.pipe';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ContentApiService } from '../../core/api/content-api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ReleaseSummary } from '../../core/models/content.models';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  imports: [LocalizedDatePipe, RouterLink],
  template: `
    <section class="page-hero">
      <div class="container page-hero__inner">
        <p class="eyebrow">{{ i18n.t('releases.eyebrow') }}</p>
        <h1>{{ i18n.t('releases.title') }}</h1>
        <p class="lead">{{ i18n.t('releases.lead') }}</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        @if (loading()) {
          <div class="stack">
            @for (placeholder of [1, 2]; track placeholder) {
              <div class="skeleton" style="height: 150px"></div>
            }
          </div>
        } @else if (!releases().length) {
          <p class="muted">{{ i18n.t('releases.empty') }}</p>
        } @else {
          <ol class="timeline">
            @for (item of releases(); track item.version) {
              <li class="entry">
                <span class="entry__dot" aria-hidden="true"></span>
                <a class="card card--hover entry__card" [routerLink]="['/releases', item.version]">
                  <div class="entry__head">
                    <span class="mono entry__version">{{ item.version }}</span>
                    @if (item.isPrerelease) {
                      <span class="badge badge--warning">{{ i18n.t('releases.prerelease') }}</span>
                    }
                    <time class="muted small">{{ item.releaseDate | rkDate: 'long' : i18n.language() }}</time>
                  </div>
                  <h2>{{ item.title }}</h2>
                  <p>{{ item.summary }}</p>
                  <span class="entry__cta">{{ i18n.t('common.learnMore') }} →</span>
                </a>
              </li>
            }
          </ol>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .timeline { position: relative; display: grid; gap: 1.2rem; margin: 0; padding: 0 0 0 1.75rem; list-style: none; }
      .timeline::before { content: ''; position: absolute; top: .6rem; bottom: .6rem; left: .34rem; width: 1px; background: var(--rk-border-strong); }
      .entry { position: relative; }
      .entry__dot {
        position: absolute;
        top: 1.5rem;
        left: -1.75rem;
        width: 11px; height: 11px;
        border: 2px solid var(--rk-bg);
        border-radius: 50%;
        background: var(--rk-primary);
      }
      .entry__card { color: inherit; }
      .entry__head { display: flex; flex-wrap: wrap; align-items: center; gap: .6rem; }
      .entry__version { color: var(--rk-primary); font-weight: 700; font-size: .88rem; }
      .entry__head time { margin-left: auto; }
      .entry__card h2 { font-size: 1.25rem; }
      .entry__cta { margin-top: auto; padding-top: .5rem; color: var(--rk-primary); font-size: .88rem; font-weight: 680; }
    `,
  ],
})
export class ReleasesComponent {
  readonly i18n = inject(I18nService);
  private readonly api = inject(ContentApiService);

  readonly loading = signal(true);
  readonly releases = signal<ReleaseSummary[]>([]);

  constructor() {
    inject(SeoService).apply({
      title: 'Releases — RelaxKon',
      description: 'RelaxKonOS release notes with highlights, changes and known limitations.',
      path: '/releases',
    });

    this.api
      .releases()
      .pipe(catchError(() => of<ReleaseSummary[]>([])))
      .subscribe(items => {
        this.releases.set(items);
        this.loading.set(false);
      });
  }
}
