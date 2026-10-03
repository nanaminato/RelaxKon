import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { docsUrl } from '../../core/docs/docs-link';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';
import { GithubLinkComponent } from '../../shared/components/github-link/github-link.component';

@Component({
  imports: [RouterLink, GithubLinkComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly i18n = inject(I18nService);

  readonly features = [0, 1, 2, 3, 4, 5].map(index => ({
    index,
    glyph: ['◧', '♾', '⬚', '⌘', '⛨', '⬡'][index],
  }));

  readonly appGroups: { titleKey: string; apps: string[] }[] = [
    { titleKey: 'home.apps.groupEveryday', apps: ['terminal', 'fileManager', 'browser', 'notepad', 'imageViewer'] },
    { titleKey: 'home.apps.groupSystem', apps: ['settings', 'serverCenter', 'taskManager', 'processGuardian', 'docker', 'registry', 'appInstaller', 'welcome'] },
    { titleKey: 'home.apps.groupNetwork', apps: ['firewall', 'portForwarding', 'tunnels', 'proxyManager', 'webServers', 'certificates', 'fileServices'] },
    { titleKey: 'home.apps.groupDeveloper', apps: ['codeEditor', 'git', 'applicationDeployments'] },
  ];

  readonly mobileLink = computed(() => docsUrl(this.i18n.language(), 'getting-started/android'));

  readonly platforms = [
    { key: 'windows', textKey: 'windowsText' },
    { key: 'linux', textKey: 'linuxText' },
    { key: 'macos', textKey: 'macosText' },
    { key: 'android', textKey: 'androidText' },
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

  /** Rebuilt per language so visitors are never sent to another language's docs. */
  readonly docCards = computed(() => {
    const language = this.i18n.language();
    return [
      { titleKey: 'home.docs.card1Title', textKey: 'home.docs.card1Text', link: docsUrl(language, 'getting-started/introduction') },
      { titleKey: 'home.docs.card2Title', textKey: 'home.docs.card2Text', link: docsUrl(language, 'apps/terminal') },
      { titleKey: 'home.docs.card3Title', textKey: 'home.docs.card3Text', link: docsUrl(language, 'concepts/architecture') },
    ];
  });

  readonly appsDocsLink = computed(() => docsUrl(this.i18n.language(), 'apps/terminal'));

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
