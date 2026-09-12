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
  templateUrl: './downloads.component.html',
  styleUrl: './downloads.component.scss',
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
