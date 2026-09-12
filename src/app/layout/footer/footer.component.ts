import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <div class="container footer__inner">
        <div class="footer__brand">
          <a class="brand" routerLink="/">
            <span class="brand__mark" aria-hidden="true">R</span>
            <span class="brand__text">Relax<span>Kon</span></span>
          </a>
          <p class="muted small">{{ i18n.t('footer.description') }}</p>
          <p class="badge">{{ i18n.t('brand.tagline') }}</p>
        </div>

        <nav class="footer__cols" aria-label="Footer">
          <div class="footer__col">
            <h3>{{ i18n.t('footer.product') }}</h3>
            <a routerLink="/products/relaxkonos">{{ i18n.t('footer.linkProduct') }}</a>
            <a routerLink="/downloads">{{ i18n.t('footer.linkDownloads') }}</a>
            <a routerLink="/releases">{{ i18n.t('footer.linkReleases') }}</a>
          </div>
          <div class="footer__col">
            <h3>{{ i18n.t('footer.resources') }}</h3>
            <a routerLink="/docs">{{ i18n.t('footer.linkDocs') }}</a>
            <a routerLink="/docs/en-US/latest/concepts/architecture">{{ i18n.t('footer.linkArchitecture') }}</a>
            <a routerLink="/docs/en-US/latest/concepts/security">{{ i18n.t('footer.linkSecurity') }}</a>
            <a routerLink="/faq">{{ i18n.t('footer.linkFaq') }}</a>
          </div>
          <div class="footer__col">
            <h3>{{ i18n.t('footer.project') }}</h3>
            <a routerLink="/about">{{ i18n.t('footer.linkAbout') }}</a>
            <span class="muted small">{{ i18n.t('brand.domain') }}</span>
          </div>
        </nav>
      </div>

      <div class="footer__bottom">
        <div class="container footer__bottom-inner">
          <span class="small muted">© {{ year }} {{ i18n.t('brand.name') }}. {{ i18n.t('footer.rights') }}</span>
          <span class="small muted">{{ i18n.t('footer.builtWith') }}</span>
        </div>
      </div>
    </footer>
  `,
  styles: [
    `
      .site-footer { margin-top: auto; border-top: 1px solid var(--rk-border); background: var(--rk-surface-secondary); }
      .footer__inner {
        display: grid;
        grid-template-columns: minmax(0, 1.15fr) minmax(0, 1.6fr);
        gap: clamp(2rem, 5vw, 4rem);
        padding-block: clamp(2.5rem, 5vw, 4rem);
      }
      .brand { display: inline-flex; align-items: center; gap: .6rem; color: var(--rk-text); }
      .brand__mark {
        display: grid; place-items: center;
        width: 30px; height: 30px;
        border-radius: 9px;
        background: linear-gradient(140deg, var(--rk-primary), var(--rk-accent));
        color: #fff; font-weight: 850; font-size: .95rem;
      }
      .brand__text { font-size: 1.1rem; font-weight: 800; letter-spacing: -.05em; }
      .brand__text span { color: var(--rk-primary); font-weight: 700; }
      .footer__brand p { max-width: 34ch; margin: .9rem 0 0; }
      .footer__cols { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.5rem; }
      .footer__col { display: grid; gap: .55rem; align-content: start; }
      .footer__col h3 {
        margin-bottom: .3rem;
        color: var(--rk-text);
        font-size: .78rem;
        font-weight: 760;
        letter-spacing: .1em;
        text-transform: uppercase;
      }
      .footer__col a { color: var(--rk-text-secondary); font-size: .92rem; }
      .footer__col a:hover { color: var(--rk-primary); }
      .footer__bottom { border-top: 1px solid var(--rk-border); }
      .footer__bottom-inner { display: flex; flex-wrap: wrap; justify-content: space-between; gap: .5rem; padding-block: 1.1rem; }
      @media (max-width: 860px) {
        .footer__inner { grid-template-columns: 1fr; }
        .footer__cols { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 520px) {
        .footer__cols { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class FooterComponent {
  readonly i18n = inject(I18nService);
  readonly year = new Date().getFullYear();
}
