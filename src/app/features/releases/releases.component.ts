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
  templateUrl: './releases.component.html',
  styleUrl: './releases.component.scss',
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
