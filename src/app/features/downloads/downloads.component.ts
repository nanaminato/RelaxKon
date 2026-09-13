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
  readonly copied = signal<'installer' | 'checksum' | null>(null);
  readonly installerOrigin = this.getInstallerOrigin();

  readonly groups = computed(() => {
    const map = new Map<string, DownloadInfo[]>();
    for (const item of this.items()) {
      const list = map.get(item.platform) ?? [];
      list.push(item);
      map.set(item.platform, list);
    }
    return [...map.entries()].map(([platform, groupItems]) => ({ platform, items: groupItems }));
  });

  readonly availableItems = computed(() => this.items().filter(item => item.isAvailable && !!item.url));

  readonly installerCommand = computed(() => {
    const base = `${this.installerOrigin}/relaxkonos/stable/latest`;
    return this.selectedInstaller() === 'windows'
      ? `irm ${base}/install.ps1 | iex`
      : `curl -fsSL ${base}/bootstrap/install-relaxkonos.sh | sudo bash`;
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

  async copy(value: string, type: 'installer' | 'checksum'): Promise<void> {
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

  private detectInstallerPlatform(): 'windows' | 'linux' {
    if (!this.isBrowser) return 'windows';
    return navigator.userAgent.toLowerCase().includes('linux') ? 'linux' : 'windows';
  }

  private getInstallerOrigin(): string {
    if (!this.isBrowser) return 'https://downloads.relaxkon.com';
    const origin = window.location.origin;
    return /^https:\/\/(?:www\.)?relaxkon\.com$/i.test(origin) || /^https:\/\/downloads\.relaxkon\.com$/i.test(origin)
      ? origin
      : 'https://downloads.relaxkon.com';
  }
}
