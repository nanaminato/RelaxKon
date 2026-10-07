import { docsUrl } from '../../core/docs/docs-link';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LocalizedDatePipe } from '../../core/pipes/localized-date.pipe';
import { RouterLink } from '@angular/router';
import { ContentApiService } from '../../core/api/content-api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { DownloadInfo } from '../../core/models/content.models';
import { SeoService } from '../../core/seo/seo.service';
import { GithubLinkComponent } from '../../shared/components/github-link/github-link.component';
import { DOWNLOAD_PLATFORMS, DeviceTarget, DownloadPlatform, detectDevice, latestDownloads } from './download-selection';

@Component({
  imports: [LocalizedDatePipe, RouterLink, GithubLinkComponent, FormsModule],
  templateUrl: './downloads.component.html',
  styleUrl: './downloads.component.scss',
})
export class DownloadsComponent {
  readonly i18n = inject(I18nService);
  private readonly api = inject(ContentApiService);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly destroyRef = inject(DestroyRef);
  private readonly seo = inject(SeoService);

  readonly loading = signal(true);
  readonly items = signal<DownloadInfo[]>([]);
  readonly failed = signal(false);
  readonly platforms = DOWNLOAD_PLATFORMS;
  readonly device = signal<DeviceTarget>(this.isBrowser ? detectDevice(navigator.userAgent, '', navigator.maxTouchPoints) : { platform: null, architecture: null });
  readonly selectedPlatform = signal<DownloadPlatform | null>(this.device().platform);
  readonly selectedArchitecture = signal('');
  readonly latestItems = computed(() => latestDownloads(this.items()));
  readonly clients = computed(() => this.latestItems().filter(item => item.packageKind === 'client'));
  readonly platformClients = computed(() => this.clients().filter(item => item.platform === this.selectedPlatform()));
  readonly architectures = computed(() => {
    const values = new Set(this.platformClients().map(item => item.architecture));
    if (this.device().platform === this.selectedPlatform() && this.device().architecture) values.add(this.device().architecture!);
    return [...values].sort();
  });
  readonly recommended = computed(() => this.platformClients().find(item => item.architecture === this.selectedArchitecture()) ?? null);
  readonly gettingStartedLink = computed(() => docsUrl(this.i18n.language(), this.selectedPlatform() === 'android' ? 'getting-started/android' : 'getting-started/quick-start'));
  readonly copied = signal<'client' | 'checksum' | null>(null);

  readonly groups = computed(() => {
    const map = new Map<string, DownloadInfo[]>();
    for (const item of this.latestItems()) {
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

  readonly availableItems = this.latestItems;
  readonly androidItems = computed(() => this.availableItems().filter(item => item.platform === 'android' && item.fileName?.endsWith('.apk')));
  readonly userModeItems = computed(() => this.availableItems().filter(item => item.packageKind === 'user-server'));
  readonly androidDocLink = computed(() => docsUrl(this.i18n.language(), 'getting-started/android'));

  readonly installationDocLink = computed(() => docsUrl(this.i18n.language(), 'getting-started/installation'));
  readonly serverCenterDocLink = computed(() => docsUrl(this.i18n.language(), 'apps/server-center'));

  /** User Mode is documented per language, so the link follows the site language. */
  readonly userModeDocLink = computed(() => ['/docs', this.i18n.language(), 'latest', 'getting-started', 'user-mode']);

  constructor() {
    this.seo.apply({
      titleKey: 'pageTitles.downloads',
      descriptionKey: 'pageDescriptions.downloads',
      path: '/downloads',
    });

    this.loadDownloads();
    if (this.isBrowser) void this.refineDevice();
  }

  loadDownloads(): void {
    this.loading.set(true);
    this.failed.set(false);
    this.api.downloads().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: items => {
        this.items.set(items);
        this.chooseArchitecture();
        this.loading.set(false);
        this.seo.apply({
          titleKey: 'pageTitles.downloads', descriptionKey: 'pageDescriptions.downloads', path: '/downloads',
          software: this.clients().map(item => ({ version: item.version, platform: this.platformLabel(item.platform), url: this.downloadHref(item.url) })),
        });
      },
      error: () => { this.failed.set(true); this.loading.set(false); },
    });
  }

  private manuallySelected = false;
  selectPlatform(platform: DownloadPlatform): void {
    this.manuallySelected = true;
    this.selectedPlatform.set(platform);
    this.chooseArchitecture();
  }

  selectArchitecture(value: string): void {
    this.manuallySelected = true;
    this.selectedArchitecture.set(value);
  }

  architectureLabel(value: string): string {
    return this.i18n.t(`downloads.recommendation.architectures.${value}`) === `downloads.recommendation.architectures.${value}`
      ? value : this.i18n.t(`downloads.recommendation.architectures.${value}`);
  }

  private chooseArchitecture(): void {
    const detected = this.device();
    const choices = this.architectures();
    this.selectedArchitecture.set(detected.platform === this.selectedPlatform() && detected.architecture
      ? detected.architecture : choices.length === 1 ? choices[0] : '');
  }

  private async refineDevice(): Promise<void> {
    const hints = (navigator as Navigator & { userAgentData?: { platform?: string; getHighEntropyValues?: (keys: string[]) => Promise<{ architecture?: string; bitness?: string }> } }).userAgentData;
    if (!hints) return;
    let target = detectDevice(navigator.userAgent, hints.platform, navigator.maxTouchPoints);
    try {
      const info = await hints.getHighEntropyValues?.(['architecture', 'bitness']);
      if (target.platform && info?.bitness === '64') target = { ...target, architecture: info.architecture === 'arm' ? 'arm64' : info.architecture === 'x86' ? 'x64' : target.architecture };
    } catch { /* Keep the OS recommendation and let the visitor choose the CPU. */ }
    if (this.destroyRef.destroyed || this.manuallySelected) return;
    this.device.set(target);
    this.selectedPlatform.set(target.platform);
    this.chooseArchitecture();
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
    if (!['windows', 'linux'].includes(item.platform)) return '';
    return item.platform === 'windows'
      ? `Expand-Archive .\\${archive} .\\RelaxKonOS-client\n& .\\RelaxKonOS-client\\payload\\windows\\client\\RelaxKonOS.Client.Desktop.exe`
      : `unzip ${archive} -d RelaxKonOS-client\n./RelaxKonOS-client/payload/linux/client/RelaxKonOS.Client.Desktop`;
  }

  async copy(value: string, type: 'client' | 'checksum'): Promise<void> {
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

  scrollToPackages(event: MouseEvent): void {
    event.preventDefault();
    this.document.getElementById("packages")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

}
