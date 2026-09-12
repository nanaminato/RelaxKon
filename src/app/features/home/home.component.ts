import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  imports: [RouterLink],
  template: `
    <!-- 1. Hero -->
    <section class="hero">
      <div class="hero__glow" aria-hidden="true"></div>
      <div class="container hero__grid">
        <div class="hero__copy">
          <p class="eyebrow">{{ i18n.t('home.hero.eyebrow') }}</p>
          <h1>{{ i18n.t('home.hero.title') }}</h1>
          <p class="lead">{{ i18n.t('home.hero.lead') }}</p>
          <div class="btn-row hero__actions">
            <a class="btn btn--primary btn--lg" routerLink="/products/relaxkonos">{{ i18n.t('home.hero.ctaPrimary') }}</a>
            <a class="btn btn--secondary btn--lg" routerLink="/docs">{{ i18n.t('home.hero.ctaSecondary') }}</a>
          </div>
          <p class="hero__note">
            <span class="badge badge--accent"><span class="badge__dot"></span>{{ i18n.t('home.hero.note') }}</span>
          </p>
        </div>

        <aside class="diagram" aria-hidden="true">
          <div class="diagram__layer diagram__layer--client">
            <span class="diagram__tag">{{ i18n.t('home.hero.clientTitle') }}</span>
            <strong>{{ i18n.t('home.hero.clientSubtitle') }}</strong>
            <ul>
              <li>{{ i18n.t('home.hero.clientItem1') }}</li>
              <li>{{ i18n.t('home.hero.clientItem2') }}</li>
              <li>{{ i18n.t('home.hero.clientItem3') }}</li>
            </ul>
          </div>

          <div class="diagram__link">
            <span class="diagram__line"></span>
            <span class="diagram__label">
              {{ i18n.t('home.hero.protocolLabel') }}
              <small>{{ i18n.t('home.hero.protocolItem1') }} · {{ i18n.t('home.hero.protocolItem2') }}</small>
            </span>
            <span class="diagram__line"></span>
          </div>

          <div class="diagram__layer diagram__layer--server">
            <span class="diagram__tag">{{ i18n.t('home.hero.serverTitle') }}</span>
            <strong>{{ i18n.t('home.hero.serverSubtitle') }}</strong>
            <ul>
              <li>{{ i18n.t('home.hero.serverItem1') }}</li>
              <li>{{ i18n.t('home.hero.serverItem2') }}</li>
              <li>{{ i18n.t('home.hero.serverItem3') }}</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>

    <!-- 2. Core features -->
    <section class="section">
      <div class="container">
        <div class="section__head">
          <p class="eyebrow">{{ i18n.t('home.features.eyebrow') }}</p>
          <h2>{{ i18n.t('home.features.title') }}</h2>
          <p class="lead">{{ i18n.t('home.features.lead') }}</p>
        </div>
        <div class="grid grid--3">
          @for (feature of features; track feature) {
            <article class="card card--hover feature">
              <span class="card__icon" aria-hidden="true">{{ feature.glyph }}</span>
              <h3>{{ i18n.t('home.features.items.' + feature.index + '.title') }}</h3>
              <p>{{ i18n.t('home.features.items.' + feature.index + '.text') }}</p>
            </article>
          }
        </div>
      </div>
    </section>

    <!-- 3. Applications showcase -->
    <section class="section section--tint">
      <div class="container">
        <div class="flex-between section__head section__head--wide">
          <div>
            <p class="eyebrow">{{ i18n.t('home.apps.eyebrow') }}</p>
            <h2>{{ i18n.t('home.apps.title') }}</h2>
            <p class="lead">{{ i18n.t('home.apps.lead') }}</p>
          </div>
          <a class="btn btn--secondary" routerLink="/docs/en-US/latest/apps/terminal">{{ i18n.t('home.apps.cta') }}</a>
        </div>

        <div class="apps">
          @for (group of appGroups; track group.titleKey) {
            <div class="apps__group">
              <h3 class="apps__group-title">{{ i18n.t(group.titleKey) }}</h3>
              <ul class="apps__list">
                @for (app of group.apps; track app) {
                  <li class="apps__item">{{ i18n.t('appNames.' + app) }}</li>
                }
              </ul>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- 4. Architecture -->
    <section class="section">
      <div class="container">
        <div class="section__head section__head--center">
          <p class="eyebrow">{{ i18n.t('home.architecture.eyebrow') }}</p>
          <h2>{{ i18n.t('home.architecture.title') }}</h2>
          <p class="lead">{{ i18n.t('home.architecture.lead') }}</p>
        </div>
        <div class="grid grid--3">
          <article class="card arch">
            <span class="arch__index mono">01</span>
            <h3>{{ i18n.t('home.architecture.clientTitle') }}</h3>
            <p>{{ i18n.t('home.architecture.clientText') }}</p>
          </article>
          <article class="card arch">
            <span class="arch__index mono">02</span>
            <h3>{{ i18n.t('home.architecture.protocolTitle') }}</h3>
            <p>{{ i18n.t('home.architecture.protocolText') }}</p>
          </article>
          <article class="card arch">
            <span class="arch__index mono">03</span>
            <h3>{{ i18n.t('home.architecture.serverTitle') }}</h3>
            <p>{{ i18n.t('home.architecture.serverText') }}</p>
          </article>
        </div>
        <p class="arch__caption">{{ i18n.t('home.architecture.diagramCaption') }}</p>
      </div>
    </section>

    <!-- 5. Cross-platform + 6. Security -->
    <section class="section section--tint">
      <div class="container split">
        <div>
          <p class="eyebrow">{{ i18n.t('home.platforms.eyebrow') }}</p>
          <h2>{{ i18n.t('home.platforms.title') }}</h2>
          <p class="lead">{{ i18n.t('home.platforms.lead') }}</p>
          <ul class="platforms">
            @for (platform of platforms; track platform.key) {
              <li class="platform">
                <span class="platform__name">{{ i18n.t('home.platforms.' + platform.key) }}</span>
                <span class="platform__text">{{ i18n.t('home.platforms.' + platform.textKey) }}</span>
              </li>
            }
          </ul>
          <p class="muted small">{{ i18n.t('home.platforms.serverNote') }}</p>
        </div>

        <div>
          <p class="eyebrow">{{ i18n.t('home.security.eyebrow') }}</p>
          <h2>{{ i18n.t('home.security.title') }}</h2>
          <p class="lead">{{ i18n.t('home.security.lead') }}</p>
          <div class="stack">
            @for (item of security; track item) {
              <article class="card card--tint">
                <h3>{{ i18n.t(item.titleKey) }}</h3>
                <p>{{ i18n.t(item.textKey) }}</p>
              </article>
            }
          </div>
        </div>
      </div>
    </section>

    <!-- 7. Design philosophy -->
    <section class="section">
      <div class="container philosophy">
        <div class="section__head">
          <p class="eyebrow">{{ i18n.t('home.philosophy.eyebrow') }}</p>
          <h2>{{ i18n.t('home.philosophy.title') }}</h2>
          <p class="lead">{{ i18n.t('home.philosophy.lead') }}</p>
        </div>
        <blockquote class="quote">{{ i18n.t('home.philosophy.quote') }}</blockquote>
        <div class="grid grid--4 principles">
          @for (principle of principles; track principle) {
            <div class="principle">
              <h3>{{ i18n.t(principle.titleKey) }}</h3>
              <p>{{ i18n.t(principle.textKey) }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- 8. Documentation entry -->
    <section class="section section--tint">
      <div class="container">
        <div class="flex-between section__head section__head--wide">
          <div>
            <p class="eyebrow">{{ i18n.t('home.docs.eyebrow') }}</p>
            <h2>{{ i18n.t('home.docs.title') }}</h2>
            <p class="lead">{{ i18n.t('home.docs.lead') }}</p>
          </div>
          <a class="btn btn--primary" routerLink="/docs">{{ i18n.t('home.docs.cta') }}</a>
        </div>
        <div class="grid grid--3">
          @for (card of docCards; track card) {
            <a class="card card--hover doc-card" [routerLink]="card.link">
              <h3>{{ i18n.t(card.titleKey) }}</h3>
              <p>{{ i18n.t(card.textKey) }}</p>
              <span class="doc-card__cta">{{ i18n.t('common.learnMore') }} →</span>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- 9. Download entry -->
    <section class="section">
      <div class="container">
        <div class="cta-band">
          <div>
            <p class="eyebrow">{{ i18n.t('home.download.eyebrow') }}</p>
            <h2>{{ i18n.t('home.download.title') }}</h2>
            <p class="lead">{{ i18n.t('home.download.lead') }}</p>
          </div>
          <div class="btn-row">
            <a class="btn btn--primary btn--lg" routerLink="/downloads">{{ i18n.t('home.download.cta') }}</a>
            <a class="btn btn--secondary btn--lg" routerLink="/releases">{{ i18n.t('home.download.secondary') }}</a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .hero { position: relative; overflow: hidden; padding-block: clamp(3rem, 7vw, 6rem) clamp(2.5rem, 5vw, 4.5rem); }
      .hero__glow {
        position: absolute;
        inset: -20% 40% 40% -10%;
        background: radial-gradient(circle at 40% 40%, color-mix(in srgb, var(--rk-primary) 22%, transparent), transparent 62%);
        filter: blur(10px);
        pointer-events: none;
      }
      .hero__grid { position: relative; display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr); gap: clamp(2rem, 5vw, 4rem); align-items: center; }
      .hero h1 { max-width: 20ch; }
      .hero .lead { margin-top: 1.2rem; }
      .hero__actions { margin-top: 1.9rem; }
      .hero__note { margin-top: 1.4rem; }

      .diagram { display: grid; gap: .8rem; }
      .diagram__layer {
        padding: 1.15rem 1.25rem;
        border: 1px solid var(--rk-border);
        border-radius: var(--rk-radius-lg);
        background: var(--rk-surface);
        box-shadow: var(--rk-shadow-md);
      }
      .diagram__layer--client { border-top: 3px solid var(--rk-primary); }
      .diagram__layer--server { border-top: 3px solid var(--rk-accent); }
      .diagram__tag { display: block; color: var(--rk-text-muted); font-size: .72rem; font-weight: 760; letter-spacing: .12em; text-transform: uppercase; }
      .diagram__layer strong { display: block; margin: .25rem 0 .6rem; font-size: .95rem; }
      .diagram__layer ul { margin: 0; padding-left: 1.05rem; }
      .diagram__layer li { color: var(--rk-text-secondary); font-size: .86rem; margin: .18rem 0; }
      .diagram__link { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: .7rem; }
      .diagram__line { height: 1px; background: repeating-linear-gradient(90deg, var(--rk-border-strong) 0 6px, transparent 6px 12px); }
      .diagram__label { display: grid; gap: .1rem; color: var(--rk-text-secondary); font-size: .76rem; font-weight: 680; text-align: center; white-space: nowrap; }
      .diagram__label small { color: var(--rk-text-muted); font-weight: 500; font-size: .7rem; }

      .section__head--wide { align-items: flex-end; max-width: none; gap: 2rem; }
      .feature .card__icon { margin-bottom: .35rem; }
      .arch { position: relative; padding-top: 1.7rem; }
      .arch__index { position: absolute; top: 1rem; right: 1.2rem; color: var(--rk-text-muted); font-size: .78rem; letter-spacing: .08em; }
      .arch__caption { margin: 2rem 0 0; color: var(--rk-text-muted); font-size: .88rem; text-align: center; }

      .split { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(2rem, 5vw, 4rem); align-items: start; }
      .platforms { display: grid; gap: .7rem; margin: 1.5rem 0 1rem; padding: 0; list-style: none; }
      .platform { display: grid; grid-template-columns: 96px 1fr; gap: 1rem; padding: .85rem 1rem; border: 1px solid var(--rk-border); border-radius: var(--rk-radius); background: var(--rk-surface); }
      .platform__name { font-weight: 720; }
      .platform__text { color: var(--rk-text-secondary); font-size: .9rem; }

      .philosophy { max-width: 1000px; }
      .quote {
        margin: 0 0 2.5rem;
        padding: 1.5rem 1.75rem;
        border-left: 4px solid var(--rk-primary);
        border-radius: 0 var(--rk-radius-lg) var(--rk-radius-lg) 0;
        background: var(--rk-surface-secondary);
        color: var(--rk-text);
        font-size: clamp(1.15rem, 2vw, 1.5rem);
        font-weight: 650;
        letter-spacing: -.02em;
      }
      .principle { padding-right: .5rem; }
      .principle h3 { font-size: 1rem; }
      .principle p { margin: .4rem 0 0; color: var(--rk-text-secondary); font-size: .9rem; }

      .apps { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem 2.5rem; }
      .apps__group-title { margin-bottom: .8rem; color: var(--rk-text-muted); font-size: .76rem; font-weight: 760; letter-spacing: .12em; text-transform: uppercase; }
      .apps__list { display: flex; flex-wrap: wrap; gap: .5rem; margin: 0; padding: 0; list-style: none; }
      .apps__item {
        padding: .4rem .8rem;
        border: 1px solid var(--rk-border);
        border-radius: var(--rk-radius-pill);
        background: var(--rk-surface);
        color: var(--rk-text-secondary);
        font-size: .86rem;
        font-weight: 600;
        transition: border-color var(--rk-transition), color var(--rk-transition), transform var(--rk-transition);
      }
      .apps__item:hover { border-color: var(--rk-primary); color: var(--rk-primary); transform: translateY(-1px); }

      .doc-card { color: inherit; }
      .doc-card__cta { margin-top: auto; padding-top: .6rem; color: var(--rk-primary); font-size: .88rem; font-weight: 680; }

      .cta-band {
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) auto;
        gap: 2rem;
        align-items: center;
        padding: clamp(1.75rem, 4vw, 3rem);
        border: 1px solid var(--rk-border);
        border-radius: var(--rk-radius-xl);
        background:
          radial-gradient(circle at 88% 15%, color-mix(in srgb, var(--rk-primary) 16%, transparent), transparent 55%),
          var(--rk-surface);
        box-shadow: var(--rk-shadow-md);
      }
      .cta-band .lead { margin-bottom: 0; }

      @media (max-width: 940px) {
        .hero__grid, .split, .cta-band { grid-template-columns: 1fr; }
        .apps { grid-template-columns: 1fr; }
        .section__head--wide { flex-direction: column; align-items: flex-start; }
      }
      @media (max-width: 640px) {
        .platform { grid-template-columns: 1fr; gap: .25rem; }
        .principles { gap: 1.5rem; }
      }
    `,
  ],
})
export class HomeComponent {
  readonly i18n = inject(I18nService);

  readonly features = [0, 1, 2, 3, 4, 5].map(index => ({
    index,
    glyph: ['◧', '♾', '⬚', '⌘', '⛨', '⬡'][index],
  }));

  readonly appGroups: { titleKey: string; apps: string[] }[] = [
    { titleKey: 'home.apps.groupEveryday', apps: ['terminal', 'fileManager', 'browser', 'notepad', 'imageViewer'] },
    { titleKey: 'home.apps.groupSystem', apps: ['settings', 'taskManager', 'processGuardian', 'docker', 'registry', 'appInstaller', 'welcome'] },
    { titleKey: 'home.apps.groupNetwork', apps: ['firewall', 'portForwarding', 'tunnels', 'proxyManager', 'webServers', 'certificates', 'fileServices'] },
    { titleKey: 'home.apps.groupDeveloper', apps: ['codeEditor', 'git'] },
  ];

  readonly platforms = [
    { key: 'windows', textKey: 'windowsText' },
    { key: 'linux', textKey: 'linuxText' },
    { key: 'macos', textKey: 'macosText' },
  ];

  readonly security = [
    { titleKey: 'home.security.identityTitle', textKey: 'home.security.identityText' },
    { titleKey: 'home.security.permissionTitle', textKey: 'home.security.permissionText' },
    { titleKey: 'home.security.elevationTitle', textKey: 'home.security.elevationText' },
  ];

  readonly principles = [1, 2, 3, 4].map(index => ({
    titleKey: `home.philosophy.principle${index}Title`,
    textKey: `home.philosophy.principle${index}Text`,
  }));

  readonly docCards = [
    { titleKey: 'home.docs.card1Title', textKey: 'home.docs.card1Text', link: '/docs/en-US/latest/getting-started/introduction' },
    { titleKey: 'home.docs.card2Title', textKey: 'home.docs.card2Text', link: '/docs/en-US/latest/apps/terminal' },
    { titleKey: 'home.docs.card3Title', textKey: 'home.docs.card3Text', link: '/docs/en-US/latest/concepts/architecture' },
  ];

  constructor() {
    const seo = inject(SeoService);
    seo.apply({
      title: 'RelaxKon — Desktops beyond devices',
      description:
        'RelaxKonOS is a cross-platform remote workspace operating environment with local UI rendering, persistent applications and server-managed workspaces. Not RDP, VNC or pixel streaming.',
      path: '/',
    });
  }
}
