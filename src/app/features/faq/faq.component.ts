import { Component, computed, effect, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { ContentApiService } from '../../core/api/content-api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { FaqItem } from '../../core/models/content.models';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent {
  readonly i18n = inject(I18nService);
  private readonly api = inject(ContentApiService);

  readonly loading = signal(true);
  readonly items = signal<FaqItem[]>([]);

  readonly groups = computed(() => {
    const map = new Map<string, FaqItem[]>();
    for (const item of this.items()) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return [...map.entries()].map(([category, groupItems]) => ({
      category,
      items: groupItems.slice().sort((a, b) => a.order - b.order),
    }));
  });

  constructor() {
    inject(SeoService).apply({
      title: 'FAQ — RelaxKon',
      description: 'Answers about the RelaxKonOS product, architecture, security model and extensibility.',
      path: '/faq',
    });

    effect(() => {
      const language = this.i18n.language();
      this.loading.set(true);
      this.api
        .faq(language)
        .pipe(catchError(() => of<FaqItem[]>([])))
        .subscribe(items => {
          this.items.set(items);
          this.loading.set(false);
        });
    });
  }
}
