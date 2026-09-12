import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  imports: [RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
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
