import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  imports: [RouterLink],
  template: `
    <section class="section not-found">
      <div class="container">
        <p class="eyebrow">{{ i18n.t('notFound.eyebrow') }}</p>
        <h1>{{ i18n.t('notFound.title') }}</h1>
        <p class="lead">{{ i18n.t('notFound.lead') }}</p>
        <div class="btn-row mt-2">
          <a class="btn btn--primary" routerLink="/">{{ i18n.t('notFound.cta') }}</a>
          <a class="btn btn--secondary" routerLink="/docs">{{ i18n.t('nav.documentation') }}</a>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .not-found { min-height: 52vh; display: grid; align-items: center; }
    `,
  ],
})
export class NotFoundComponent {
  readonly i18n = inject(I18nService);

  constructor() {
    inject(SeoService).apply({ title: '404 — RelaxKon', description: 'Page not found.' });
  }
}
