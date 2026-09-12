import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  imports: [RouterLink],
  template: `
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow">{{ i18n.t('os.eyebrow') }}</p>
        <h1>{{ i18n.t('os.title') }}</h1>
        <p class="lead">{{ i18n.t('os.lead') }}</p>
        <div class="btn-row mt-2">
          <a class="btn btn--primary btn--lg" routerLink="/docs/en-US/latest/concepts/architecture">{{ i18n.t('os.ctaPrimary') }}</a>
          <a class="btn btn--secondary btn--lg" routerLink="/downloads">{{ i18n.t('os.ctaSecondary') }}</a>
        </div>
      </div>
    </section>

    <!-- Positioning: what it is not -->
    <section class="section">
      <div class="container">
        <div class="notice notice--warning">
          <div>
            <strong>{{ i18n.t('os.notRemoteTitle') }}</strong>
            <p class="mb-0">{{ i18n.t('os.notRemoteText') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Capabilities -->
    <section class="section section--tint">
      <div class="container">
        <div class="section__head">
          <p class="eyebrow">{{ i18n.t('os.capabilitiesEyebrow') }}</p>
          <h2>{{ i18n.t('os.capabilitiesTitle') }}</h2>
        </div>
        <div class="grid grid--3">
          @for (feature of features; track feature) {
            <article class="card card--hover">
              <span class="card__icon" aria-hidden="true">{{ feature.glyph }}</span>
              <h3>{{ i18n.t('home.features.items.' + feature.index + '.title') }}</h3>
              <p>{{ i18n.t('home.features.items.' + feature.index + '.text') }}</p>
            </article>
          }
        </div>
      </div>
    </section>

    <!-- Built-in applications -->
    <section class="section">
      <div class="container">
        <div class="section__head">
          <p class="eyebrow">{{ i18n.t('os.appsEyebrow') }}</p>
          <h2>{{ i18n.t('os.appsTitle') }}</h2>
          <p class="lead">{{ i18n.t('os.appsLead') }}</p>
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

    <!-- Architecture -->
    <section class="section section--tint">
      <div class="container">
        <div class="section__head">
          <p class="eyebrow">{{ i18n.t('os.archEyebrow') }}</p>
          <h2>{{ i18n.t('os.archTitle') }}</h2>
          <p class="lead">{{ i18n.t('os.archLead') }}</p>
        </div>
        <div class="grid grid--3">
          <article class="card">
            <h3>{{ i18n.t('home.architecture.clientTitle') }}</h3>
            <p>{{ i18n.t('home.architecture.clientText') }}</p>
          </article>
          <article class="card">
            <h3>{{ i18n.t('home.architecture.protocolTitle') }}</h3>
            <p>{{ i18n.t('home.architecture.protocolText') }}</p>
          </article>
          <article class="card">
            <h3>{{ i18n.t('home.architecture.serverTitle') }}</h3>
            <p>{{ i18n.t('home.architecture.serverText') }}</p>
          </article>
        </div>
        <p class="caption">{{ i18n.t('home.architecture.diagramCaption') }}</p>

        <div class="grid grid--2 mt-2">
          <div>
            <h3>{{ i18n.t('os.platformTitle') }}</h3>
            <div class="grid grid--2">
              @for (platform of platforms; track platform.key) {
                <article class="card card--flat">
                  <h4>{{ i18n.t('home.platforms.' + platform.key) }}</h4>
                  <p>{{ i18n.t('home.platforms.' + platform.textKey) }}</p>
                </article>
              }
            </div>
            <p class="muted small mt-2">{{ i18n.t('home.platforms.serverNote') }}</p>
          </div>
          <div>
            <h3>{{ i18n.t('os.securityTitle') }}</h3>
            <p class="lead">{{ i18n.t('os.securityLead') }}</p>
            <div class="stack">
              @for (item of security; track item) {
                <article class="card card--flat">
                  <h4>{{ i18n.t(item.titleKey) }}</h4>
                  <p>{{ i18n.t(item.textKey) }}</p>
                </article>
              }
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Extensibility -->
    <section class="section">
      <div class="container split">
        <div>
          <p class="eyebrow">{{ i18n.t('os.extendEyebrow') }}</p>
          <h2>{{ i18n.t('os.extendTitle') }}</h2>
          <p class="lead">{{ i18n.t('os.extendLead') }}</p>
          <a class="btn btn--secondary" routerLink="/docs/en-US/latest/concepts/application-model">{{ i18n.t('os.extendCta') }}</a>
        </div>
        <div class="code-sample">
          <div class="code-sample__bar" aria-hidden="true">
            <span></span><span></span><span></span>
            <em class="mono">MyApp.cs</em>
          </div>
          <pre><code>{{ sampleCode }}</code></pre>
        </div>
      </div>
    </section>

    <!-- Status -->
    <section class="section section--tint">
      <div class="container">
        <div class="section__head">
          <p class="eyebrow">{{ i18n.t('os.statusEyebrow') }}</p>
          <h2>{{ i18n.t('os.statusTitle') }}</h2>
          <p class="lead">{{ i18n.t('os.statusLead') }}</p>
        </div>
        <ul class="status">
          @for (item of statusItems; track item) {
            <li>
              <span class="status__mark" aria-hidden="true">✓</span>
              <span>{{ i18n.t(item) }}</span>
            </li>
          }
        </ul>
        <div class="btn-row mt-2">
          <a class="btn btn--primary" routerLink="/downloads">{{ i18n.t('home.download.cta') }}</a>
          <a class="btn btn--ghost" routerLink="/releases">{{ i18n.t('home.download.secondary') }}</a>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .caption { margin: 2rem 0 3rem; color: var(--rk-text-muted); font-size: .88rem; }
      .split { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(2rem, 5vw, 4rem); align-items: start; }
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
      }
      .apps__item:hover { border-color: var(--rk-primary); color: var(--rk-primary); }
      .code-sample { overflow: hidden; border: 1px solid var(--rk-border); border-radius: var(--rk-radius-lg); background: var(--rk-code-bg); box-shadow: var(--rk-shadow-md); }
      .code-sample__bar { display: flex; align-items: center; gap: .4rem; padding: .6rem .85rem; border-bottom: 1px solid rgb(255 255 255 / 8%); }
      .code-sample__bar span { width: 10px; height: 10px; border-radius: 50%; background: rgb(255 255 255 / 22%); }
      .code-sample__bar em { margin-left: auto; color: rgb(255 255 255 / 55%); font-size: .74rem; font-style: normal; }
      .code-sample pre { margin: 0; padding: 1.1rem 1.2rem; overflow-x: auto; color: var(--rk-code-text); font-family: var(--rk-font-mono); font-size: .84rem; line-height: 1.65; }
      .status { display: grid; gap: .7rem; margin: 0; padding: 0; list-style: none; }
      .status li { display: flex; gap: .7rem; align-items: flex-start; color: var(--rk-text-secondary); }
      .status__mark { flex: none; display: grid; place-items: center; width: 20px; height: 20px; margin-top: .18rem; border-radius: 50%; background: var(--rk-success-soft); color: var(--rk-success); font-size: .72rem; font-weight: 800; }
      @media (max-width: 940px) {
        .split, .apps, .grid--2 { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class RelaxKonOsComponent {
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

  readonly statusItems = ['os.statusItem1', 'os.statusItem2', 'os.statusItem3', 'os.statusItem4'];

  readonly sampleCode = `public class MyApp : RemoteApplicationBase
{
    public override string Id => "com.example.myapp";
    public override string DisplayName => "My Application";

    public override void Activate(AppContext context)
    {
        context.ShowWindow("My Window", contentFactory: () => new MyView());
    }
}`;

  constructor() {
    const seo = inject(SeoService);
    seo.apply({
      title: 'RelaxKonOS — A modern remote workspace operating environment',
      description:
        'RelaxKonOS is a cross-platform, cloud-native desktop operating environment with local UI rendering, persistent applications, server-managed workspaces and twenty-plus built-in applications.',
      path: '/products/relaxkonos',
    });
  }
}
