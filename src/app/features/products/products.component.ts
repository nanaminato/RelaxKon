import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  imports: [RouterLink],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
})
export class ProductsComponent {
  readonly i18n = inject(I18nService);

  constructor() {
    inject(SeoService).apply({
      title: 'Products — RelaxKon',
      description: 'RelaxKon software products: RelaxKonOS, a cross-platform cloud-native desktop operating environment.',
      path: '/products',
    });
  }
}
