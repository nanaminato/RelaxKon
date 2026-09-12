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
  templateUrl: './release-detail.component.html',
  styleUrl: './release-detail.component.scss',
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
