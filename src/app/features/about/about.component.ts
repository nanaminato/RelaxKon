import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTACT_EMAIL, CONTACT_EMAIL_URL } from '../../core/config/site-links';
import { docsUrl } from '../../core/docs/docs-link';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';
import { GithubLinkComponent } from '../../shared/components/github-link/github-link.component';

@Component({
  imports: [RouterLink, GithubLinkComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  readonly i18n = inject(I18nService);

  /** Maintainer contact address, shown in the contact section. */
  readonly contactEmail = CONTACT_EMAIL;
  readonly contactEmailUrl = CONTACT_EMAIL_URL;

  readonly principles = [1, 2, 3].map(index => ({
    titleKey: `about.principle${index}Title`,
    textKey: `about.principle${index}Text`,
  }));

  readonly projects = [
    { name: 'RelaxKon', textKey: 'about.project1Text' },
    { name: 'RelaxKonServer', textKey: 'about.project2Text' },
    { name: 'RelaxKonOS', textKey: 'about.project3Text' },
  ];

  /** Architecture link follows the language the visitor is reading. */
  readonly architectureLink = computed(() => docsUrl(this.i18n.language(), 'concepts/architecture'));

  constructor() {
    inject(SeoService).apply({
      titleKey: 'pageTitles.about',
      descriptionKey: 'pageDescriptions.about',
      path: '/about',
    });
  }
}
