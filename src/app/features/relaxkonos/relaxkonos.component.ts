import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { docsUrl } from '../../core/docs/docs-link';
import { I18nService } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';

/**
 * Dictionary key -> documentation slug for every application named on this page.
 * Every entry is backed by a real page; `docsUrl` resolves it against the current
 * UI language so a Chinese or Japanese visitor stays in their own documentation.
 *
 * Network Inspector is deliberately absent: it is a shell-owned system window,
 * not a built-in application, and is linked from the notice section instead.
 */
const APP_DOCS_SLUGS: Record<string, string> = {
  welcome: 'apps/welcome',
  fileManager: 'apps/file-manager',
  terminal: 'apps/terminal',
  browser: 'apps/browser',
  codeEditor: 'apps/code-editor',
  notepad: 'apps/notepad',
  imageViewer: 'apps/image-viewer',
  settings: 'apps/settings',
  serverCenter: 'apps/server-center',
  taskManager: 'apps/task-manager',
  docker: 'apps/docker',
  processGuardian: 'apps/process-guardian',
  firewall: 'apps/firewall',
  portForwarding: 'apps/port-forwarding',
  tunnels: 'apps/tunnel-manager',
  proxyManager: 'apps/proxy-manager',
  webServers: 'apps/web-server-manager',
  certificates: 'apps/certificate-manager',
  fileServices: 'apps/file-services',
  registry: 'apps/registry',
  appInstaller: 'apps/app-installer',
  git: 'apps/git-client',
  applicationDeployments: 'apps/application-deployments',
};

@Component({
  imports: [RouterLink],
  templateUrl: './relaxkonos.component.html',
  styleUrl: './relaxkonos.component.scss',
})
export class RelaxKonOsComponent {
  readonly i18n = inject(I18nService);

  readonly features = [0, 1, 2, 3, 4, 5].map(index => ({
    index,
    glyph: ['◧', '♾', '⬚', '⌘', '⛨', '⬡'][index],
  }));

  private readonly appGroupKeys: { titleKey: string; apps: string[] }[] = [
    { titleKey: 'home.apps.groupEveryday', apps: ['terminal', 'fileManager', 'browser', 'notepad', 'imageViewer'] },
    { titleKey: 'home.apps.groupSystem', apps: ['settings', 'serverCenter', 'taskManager', 'processGuardian', 'docker', 'registry', 'appInstaller', 'welcome'] },
    { titleKey: 'home.apps.groupNetwork', apps: ['firewall', 'portForwarding', 'tunnels', 'proxyManager', 'webServers', 'certificates', 'fileServices'] },
    { titleKey: 'home.apps.groupDeveloper', apps: ['codeEditor', 'git', 'applicationDeployments'] },
  ];

  /** Apps resolve to documentation links in the language being read. */
  readonly appGroups = computed(() => {
    const language = this.i18n.language();
    return this.appGroupKeys.map(group => ({
      titleKey: group.titleKey,
      apps: group.apps.map(app => ({
        key: app,
        link: docsUrl(language, APP_DOCS_SLUGS[app] ?? 'getting-started/introduction'),
      })),
    }));
  });

  readonly architectureLink = computed(() => docsUrl(this.i18n.language(), 'concepts/architecture'));
  readonly applicationModelLink = computed(() => docsUrl(this.i18n.language(), 'concepts/application-model'));
  readonly networkInspectorLink = computed(() => docsUrl(this.i18n.language(), 'apps/network-inspector'));
  readonly applicationDeploymentsLink = computed(() => docsUrl(this.i18n.language(), 'apps/application-deployments'));

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

  readonly eventsLink = computed(() => docsUrl(this.i18n.language(), 'apps/event-alerts'));
  readonly backupLink = computed(() => docsUrl(this.i18n.language(), 'apps/backup-recovery'));

  readonly statusItems = ['os.statusItem1', 'os.statusItem2', 'os.statusItem3', 'os.statusItem4'];

  readonly sampleCode = `using Avalonia.Controls;
using RelaxKonOS.AppSDK;
using RelaxKonOS.Core.Applications;
using System.Threading;
using System.Threading.Tasks;

public sealed class MyApp : IExternalRemoteApplication
{
    public ApplicationManifest Manifest { get; } = new(
        new AppId("com.example.myapp"), "My Application");

    public Task ActivateAsync(IExternalAppContext context,
        CancellationToken cancellationToken = default)
    {
        context.Windows.ShowWindow("My Window",
            new TextBlock { Text = "Hello, RelaxKonOS!" });
        return Task.CompletedTask;
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
