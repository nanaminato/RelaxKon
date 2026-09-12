import { Component, computed, inject, signal } from '@angular/core';
import { LocalizedDatePipe } from '../../core/pipes/localized-date.pipe';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ContentApiService } from '../../core/api/content-api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { DownloadInfo } from '../../core/models/content.models';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  imports: [LocalizedDatePipe, RouterLink],
  template: `
    <section class="page-hero">
      <div class="container page-hero__inner">
        <p class="eyebrow">{{ i18n.t('downloads.eyebrow') }}</p>
        <h1>{{ i18n.t('downloads.title') }}</h1>
        <p class="lead">{{ i18n.t('downloads.lead') }}</p>
        <p class="notice notice--warning mt-2">{{ i18n.t('downloads.note') }}</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        @if (loading()) {
          <div class="grid grid--3">
            @for (placeholder of [1, 2, 3]; track placeholder) {
              <div class="skeleton" style="height: 190px"></div>
            }
          </div>
        } @else if (!groups().length) {
          <p class="muted">{{ i18n.t('downloads.empty') }}</p>
        } @else {
          <div class="stack groups">
            @for (group of groups(); track group.platform) {
              <section class="group">
                <header class="group__head">
                  <h2>{{ group.platform }}</h2>
                  <span class="muted small">{{ group.items.length }} {{ i18n.t('downloads.latest') }}</span>
                </header>
                <div class="grid grid--2">
                  @for (item of group.items; track item.architecture + item.version) {
                    <article class="card download">
                      <div class="download__head">
                        <span class="chip mono">{{ item.architecture }}</span>
                        @if (item.isAvailable) {
                          <span class="badge badge--success"><span class="badge__dot"></span>{{ i18n.t('common.available') }}</span>
                        } @else {
                          <span class="badge badge--warning">{{ i18n.t('common.comingSoon') }}</span>
                        }
                      </div>
                      <dl class="download__meta">
                        <div><dt>{{ i18n.t('common.version') }}</dt><dd class="mono">{{ item.version }}</dd></div>
                        <div><dt>{{ i18n.t('common.releaseDate') }}</dt><dd>{{ item.releaseDate | rkDate: 'medium' : i18n.language() }}</dd></div>
                        <div><dt>{{ i18n.t('common.fileSize') }}</dt><dd class="mono">{{ item.size }}</dd></div>
                        @if (item.checksum) {
                          <div class="download__checksum"><dt>{{ i18n.t('common.checksum') }}</dt><dd class="mono">{{ item.checksum }}</dd></div>
                        }
                      </dl>
                      @if (item.fileName) { <p class="mono small muted mb-0">{{ item.fileName }}</p> }
                      @if (item.isAvailable && item.url) {
                        <a class="btn btn--primary btn--sm" [href]="item.url" download>{{ i18n.t('common.download') }}</a>
                      } @else {
                        <button class="btn btn--secondary btn--sm" type="button" disabled>{{ i18n.t('common.notAvailable') }}</button>
                      }
                    </article>
                  }
                </div>
              </section>
            }
          </div>
          <p class="muted small mt-2">{{ i18n.t('downloads.serverHint') }}</p>
          <a class="btn btn--ghost" routerLink="/releases">{{ i18n.t('releases.title') }} →</a>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .groups { gap: 2.5rem; }
      .group__head { display: flex; align-items: baseline; gap: 1rem; margin-bottom: 1rem; }
      .group__head h2 { margin: 0; font-size: 1.35rem; }
      .download { gap: .8rem; }
      .download__head { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
      .download__meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem .9rem; margin: 0; }
      .download__meta div { display: grid; gap: .1rem; }
      .download__meta dt { color: var(--rk-text-muted); font-size: .72rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
      .download__meta dd { margin: 0; font-size: .9rem; }
      .download__checksum { grid-column: 1 / -1; }
      .download__checksum dd { overflow-wrap: anywhere; font-size: .8rem; color: var(--rk-text-muted); }
      .download .btn { align-self: flex-start; }
    `,
  ],
})
export class DownloadsComponent {
  readonly i18n = inject(I18nService);
  private readonly api = inject(ContentApiService);

  readonly loading = signal(true);
  readonly items = signal<DownloadInfo[]>([]);

  readonly groups = computed(() => {
    const map = new Map<string, DownloadInfo[]>();
    for (const item of this.items()) {
      const list = map.get(item.platform) ?? [];
      list.push(item);
      map.set(item.platform, list);
    }
    return [...map.entries()].map(([platform, groupItems]) => ({ platform, items: groupItems }));
  });

  constructor() {
    inject(SeoService).apply({
      title: 'Downloads — RelaxKon',
      description: 'Download RelaxKonOS builds for Windows, Linux and macOS with checksums and release dates.',
      path: '/downloads',
    });

    this.api
      .downloads()
      .pipe(catchError(() => of<DownloadInfo[]>([])))
      .subscribe(items => {
        this.items.set(items);
        this.loading.set(false);
      });
  }
}
