import { Component, computed, effect, inject, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { ContentApiService } from '../../core/api/content-api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { FaqItem } from '../../core/models/content.models';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  template: `
    <section class="page-hero">
      <div class="container page-hero__inner">
        <p class="eyebrow">{{ i18n.t('faq.eyebrow') }}</p>
        <h1>{{ i18n.t('faq.title') }}</h1>
        <p class="lead">{{ i18n.t('faq.lead') }}</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        @if (loading()) {
          <div class="stack">
            @for (placeholder of [1, 2, 3]; track placeholder) {
              <div class="skeleton" style="height: 66px"></div>
            }
          </div>
        } @else if (!groups().length) {
          <p class="muted">{{ i18n.t('faq.empty') }}</p>
        } @else {
          <div class="stack faq">
            @for (group of groups(); track group.category) {
              <section class="faq__group">
                <h2 class="faq__category">{{ group.category }}</h2>
                <div class="faq__items">
                  @for (item of group.items; track item.question) {
                    <details class="card faq__item" [open]="$first && group === groups()[0]">
                      <summary>{{ item.question }}</summary>
                      <p>{{ item.answer }}</p>
                    </details>
                  }
                </div>
              </section>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .faq { gap: 2.25rem; }
      .faq__category { margin-bottom: .9rem; color: var(--rk-text-muted); font-size: .78rem; font-weight: 760; letter-spacing: .12em; text-transform: uppercase; }
      .faq__items { display: grid; gap: .7rem; }
      .faq__item { padding: 0; overflow: hidden; }
      .faq__item summary {
        display: flex;
        align-items: center;
        gap: .8rem;
        padding: 1rem 1.2rem;
        cursor: pointer;
        font-weight: 680;
        list-style: none;
      }
      .faq__item summary::-webkit-details-marker { display: none; }
      .faq__item summary::after {
        content: '+';
        margin-left: auto;
        color: var(--rk-text-muted);
        font-size: 1.15rem;
        font-weight: 600;
        transition: transform var(--rk-transition);
      }
      .faq__item[open] summary::after { content: '–'; }
      .faq__item p { margin: 0; padding: 0 1.2rem 1.1rem; max-width: 92ch; }
    `,
  ],
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
