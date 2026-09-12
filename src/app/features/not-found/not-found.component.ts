import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  imports: [RouterLink],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  readonly i18n = inject(I18nService);

  constructor() {
    inject(SeoService).apply({ title: '404 — RelaxKon', description: 'Page not found.' });
  }
}
