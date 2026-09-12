import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  imports: [RouterLink],
  template: `
    <section class="page-hero">
      <div class="container page-hero__inner">
        <p class="eyebrow">{{ i18n.t('products.eyebrow') }}</p>
        <h1>{{ i18n.t('products.title') }}</h1>
        <p class="lead">{{ i18n.t('products.lead') }}</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="grid grid--2">
          <a class="product" routerLink="/products/relaxkonos">
            <div class="product__head">
              <span class="product__mark" aria-hidden="true">R</span>
              <span class="badge badge--primary">{{ i18n.t('downloads.prerelease') }}</span>
            </div>
            <h2>{{ i18n.t('products.cardTitle') }}</h2>
            <p>{{ i18n.t('products.cardText') }}</p>
            <ul class="product__points">
              <li>{{ i18n.t('home.features.items.0.title') }}</li>
              <li>{{ i18n.t('home.features.items.1.title') }}</li>
              <li>{{ i18n.t('home.features.items.3.title') }}</li>
            </ul>
            <span class="product__cta">{{ i18n.t('products.cardHref') }} →</span>
          </a>

          <article class="product product--muted">
            <h2>{{ i18n.t('products.comingTitle') }}</h2>
            <p>{{ i18n.t('products.comingText') }}</p>
            <div class="btn-row">
              <a class="btn btn--secondary" routerLink="/releases">{{ i18n.t('releases.title') }}</a>
              <a class="btn btn--ghost" routerLink="/docs">{{ i18n.t('nav.documentation') }}</a>
            </div>
          </article>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .product {
        display: flex;
        flex-direction: column;
        gap: .7rem;
        padding: clamp(1.4rem, 3vw, 2rem);
        border: 1px solid var(--rk-border);
        border-radius: var(--rk-radius-xl);
        background: var(--rk-surface);
        color: inherit;
        box-shadow: var(--rk-shadow-sm);
        transition: border-color var(--rk-transition), box-shadow var(--rk-transition), transform var(--rk-transition);
      }
      .product:hover { transform: translateY(-3px); border-color: var(--rk-border-strong); box-shadow: var(--rk-shadow-md); }
      .product--muted { background: var(--rk-surface-secondary); box-shadow: none; }
      .product--muted:hover { transform: none; border-color: var(--rk-border); box-shadow: none; }
      .product__head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
      .product__mark {
        display: grid; place-items: center;
        width: 44px; height: 44px;
        border-radius: 13px;
        background: linear-gradient(140deg, var(--rk-primary), var(--rk-accent));
        color: #fff; font-weight: 850; font-size: 1.25rem;
      }
      .product p { color: var(--rk-text-secondary); }
      .product__points { display: grid; gap: .35rem; margin: 0; padding-left: 1.1rem; color: var(--rk-text-secondary); font-size: .92rem; }
      .product__cta { margin-top: auto; padding-top: .8rem; color: var(--rk-primary); font-weight: 680; }
    `,
  ],
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
