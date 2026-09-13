import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { LocalizedDatePipe } from '../../core/pipes/localized-date.pipe';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ContentApiService } from '../../core/api/content-api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { DownloadInfo } from '../../core/models/content.models';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  imports: [LocalizedDatePipe, RouterLink],
  templateUrl: './downloads.component.html',
  styleUrl: './downloads.component.scss',
})
export class DownloadsComponent {
  readonly i18n = inject(I18nService);
  private readonly api = inject(ContentApiService);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly loading = signal(true);
  readonly items = signal<DownloadInfo[]>([]);
  readonly selectedInstaller = signal<'windows' | 'linux'>(this.detectInstallerPlatform());
  readonly copied = signal<'installer' | 'uninstaller' | 'offline' | 'client' | 'checksum' | null>(null);
  readonly installerOrigin = this.getCurrentOrigin();

  readonly groups = computed(() => {
    const map = new Map<string, DownloadInfo[]>();
    for (const item of this.items()) {
      // Content files predate the generated release feed and may spell a
      // platform differently (for example, "Windows" vs "windows"). Keep a
      // single platform section regardless of that presentation detail.
      const platform = item.platform.toLowerCase();
      const list = map.get(platform) ?? [];
      list.push(item);
      map.set(platform, list);
    }
    return [...map.entries()].map(([platform, groupItems]) => ({ platform, items: groupItems }));
  });

  readonly availableItems = computed(() => this.items().filter(item => item.isAvailable && !!item.url));
  readonly offlineServerArchive = computed(() => {
    const platform = this.selectedInstaller();
    return this.availableItems().find(item => item.platform.toLowerCase() === platform && item.packageKind === 'server')?.fileName
      ?? 'RelaxKonOS-server.zip';
  });

  readonly installerCommand = computed(() => {
    const base = `${this.installerOrigin}/relaxkonos/stable/latest`;
    return this.selectedInstaller() === 'windows'
      ? `irm ${base}/install.ps1 | iex`
      : `curl -fsSL ${base}/bootstrap/install-relaxkonos.sh | sudo bash -s -- --release-catalog-base ${base}`;
  });

  readonly uninstallerCommand = computed(() => {
    const base = `${this.installerOrigin}/relaxkonos/stable/latest`;
    return this.selectedInstaller() === 'windows'
      ? `irm ${base}/uninstall.ps1 | iex`
      : `curl -fsSL ${base}/bootstrap/uninstall-relaxkonos.sh | sudo bash`;
  });

  readonly purgeDataCommand = computed(() => {
    const base = `${this.installerOrigin}/relaxkonos/stable/latest`;
    return this.selectedInstaller() === 'windows'
      ? `& ([scriptblock]::Create((irm ${base}/uninstall.ps1))) -UninstallerArguments '-RemoveData'`
      : `curl -fsSL ${base}/bootstrap/uninstall-relaxkonos.sh | sudo bash -s -- --remove-data`;
  });

  readonly offlineInstallCommand = computed(() => {
    const archive = this.offlineServerArchive();
    return this.selectedInstaller() === 'windows'
      ? `Expand-Archive .\\${archive} .\\RelaxKonOS-server\n& .\\RelaxKonOS-server\\deployment\\bootstrap\\Install-RelaxKonOS.ps1 -BundlePath .\\${archive}`
      : `unzip ${archive} -d RelaxKonOS-server\nsudo bash ./RelaxKonOS-server/deployment/bootstrap/install-relaxkonos.sh --bundle ./${archive}`;
  });

  constructor() {
    inject(SeoService).apply({
      title: 'Downloads — RelaxKon',
      description: 'Download RelaxKonOS builds for Windows, Linux and macOS with checksums and release dates.',
      path: '/downloads',
    });

    this.api
      .downloads()
      .pipe(catchError(() => of<DownloadInfo[]>([])))
      .subscribe(items => {
        this.items.set(items);
        this.loading.set(false);
      });
  }

  selectInstaller(platform: 'windows' | 'linux'): void {
    this.selectedInstaller.set(platform);
  }

  platformLabel(platform: string): string {
    const translation = this.i18n.t(`downloads.platform.${platform.toLowerCase()}`);
    return translation === `downloads.platform.${platform.toLowerCase()}` ? platform : translation;
  }

  packageKindLabel(packageKind: DownloadInfo['packageKind']): string {
    return packageKind ? this.i18n.t(`downloads.packageKind.${packageKind}`) : this.i18n.t('downloads.packageKind.archive');
  }

  clientLaunchCommand(item: DownloadInfo): string {
    const archive = item.fileName ?? 'RelaxKonOS-client.zip';
    return item.platform.toLowerCase() === 'windows'
      ? `Expand-Archive .\\${archive} .\\RelaxKonOS-client\n& .\\RelaxKonOS-client\\payload\\windows\\client\\RelaxKonOS.Client.Desktop.exe`
      : `unzip ${archive} -d RelaxKonOS-client\n./RelaxKonOS-client/payload/linux/client/RelaxKonOS.Client.Desktop`;
  }

  async copy(value: string, type: 'installer' | 'uninstaller' | 'offline' | 'client' | 'checksum'): Promise<void> {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = this.document.createElement('textarea');
        textarea.value = value;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        this.document.body.append(textarea);
        textarea.select();
        this.document.execCommand('copy');
        textarea.remove();
      }
      this.copied.set(type);
      window.setTimeout(() => this.copied.set(null), 1800);
    } catch {
      this.copied.set(null);
    }
  }

  downloadHref(url: string): string {
    if (!url || !this.isBrowser) return url;
    try {
      const resolved = new URL(url, window.location.origin);
      // Release artifacts are served by this same website on either supported
      // hostname. Keep the anchor site-relative so it follows the hostname the
      // visitor actually chose, instead of pinning a download subdomain.
      return resolved.pathname.startsWith('/relaxkonos/')
        ? `${resolved.pathname}${resolved.search}${resolved.hash}`
        : url;
    } catch {
      return url;
    }
  }

  private detectInstallerPlatform(): 'windows' | 'linux' {
    if (!this.isBrowser) return 'windows';
    return navigator.userAgent.toLowerCase().includes('linux') ? 'linux' : 'windows';
  }

  private getCurrentOrigin(): string {
    // Shell download commands require an absolute URL, unlike browser anchors.
    // Deriving it at runtime keeps both relaxkon.com and downloads.relaxkon.com
    // on the same deployment without a hard-coded host.
    return this.isBrowser ? window.location.origin : '';
  }
}
