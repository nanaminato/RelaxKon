import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  imports: [RouterLink],
  template: `
    <section class="page-hero">
      <div class="container page-hero__inner">
        <p class="eyebrow">{{ i18n.t('about.eyebrow') }}</p>
        <h1>{{ i18n.t('about.title') }}</h1>
        <p class="lead">{{ i18n.t('about.lead') }}</p>
      </div>
    </section>

    <section class="section">
      <div class="container split">
        <div>
          <h2>{{ i18n.t('about.missionTitle') }}</h2>
          <p class="lead">{{ i18n.t('about.missionText') }}</p>
        </div>
        <div>
          <h2>{{ i18n.t('about.principleTitle') }}</h2>
          <ul class="principles">
            @for (principle of principles; track principle) {
              <li>
                <strong>{{ i18n.t(principle.titleKey) }}</strong>
                <span>{{ i18n.t(principle.textKey) }}</span>
              </li>
            }
          </ul>
        </div>
      </div>
    </section>

    <section class="section section--tint">
      <div class="container">
        <div class="section__head">
          <h2>{{ i18n.t('about.projectsTitle') }}</h2>
        </div>
        <div class="grid grid--3">
          @for (project of projects; track project) {
            <article class="card">
              <span class="badge badge--primary mono">{{ project.name }}</span>
              <p>{{ i18n.t(project.textKey) }}</p>
            </article>
          }
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container split">
        <div>
          <h2>{{ i18n.t('about.licenseTitle') }}</h2>
          <p>{{ i18n.t('about.licenseText') }}</p>
          <p class="muted small">{{ i18n.t('common.footerNote') }}</p>
        </div>
        <div>
          <h2>{{ i18n.t('about.contactTitle') }}</h2>
          <p>{{ i18n.t('about.contactText') }}</p>
          <p><span class="mono badge">{{ i18n.t('brand.domain') }}</span></p>
          <a class="btn btn--secondary" routerLink="/docs/en-US/latest/concepts/architecture">{{ i18n.t('footer.linkArchitecture') }}</a>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .split { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(2rem, 5vw, 4rem); align-items: start; }
      .principles { display: grid; gap: .9rem; margin: 0; padding: 0; list-style: none; }
      .principles li { display: grid; gap: .15rem; padding-left: 1rem; border-left: 2px solid var(--rk-primary); }
      .principles strong { font-size: .96rem; }
      .principles span { color: var(--rk-text-secondary); font-size: .9rem; }
      @media (max-width: 900px) { .split { grid-template-columns: 1fr; } }
    `,
  ],
})
export class AboutComponent {
  readonly i18n = inject(I18nService);

  readonly principles = [1, 2, 3].map(index => ({
    titleKey: `about.principle${index}Title`,
    textKey: `about.principle${index}Text`,
  }));

  readonly projects = [
    { name: 'RelaxKon', textKey: 'about.project1Text' },
    { name: 'RelaxKonServer', textKey: 'about.project2Text' },
    { name: 'RelaxKonOS', textKey: 'about.project3Text' },
  ];

  constructor() {
    inject(SeoService).apply({
      title: 'About — RelaxKon',
      description:
        'RelaxKon builds workspace software where the interface stays local and durable capabilities stay remote.',
      path: '/about',
    });
  }
}
