import { docsUrl } from '../../core/docs/docs-link';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { LocalizedDatePipe } from '../../core/pipes/localized-date.pipe';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ContentApiService } from '../../core/api/content-api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { DownloadInfo } from '../../core/models/content.models';
import { SeoService } from '../../core/seo/seo.service';
import { GithubLinkComponent } from '../../shared/components/github-link/github-link.component';

@Component({
  imports: [LocalizedDatePipe, RouterLink, GithubLinkComponent],
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
  readonly copied = signal<'client' | 'checksum' | null>(null);

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
  readonly androidItems = computed(() => this.availableItems().filter(item => item.platform === 'android' && item.fileName?.endsWith('.apk')));
  readonly userModeItems = computed(() => this.availableItems().filter(item => item.packageKind === 'user-server'));
  readonly androidDocLink = computed(() => docsUrl(this.i18n.language(), 'getting-started/android'));

  readonly installationDocLink = computed(() => docsUrl(this.i18n.language(), 'getting-started/installation'));
  readonly serverCenterDocLink = computed(() => docsUrl(this.i18n.language(), 'apps/server-center'));

  /** User Mode is documented per language, so the link follows the site language. */
  readonly userModeDocLink = computed(() => ['/docs', this.i18n.language(), 'latest', 'getting-started', 'user-mode']);

  constructor() {
    inject(SeoService).apply({
      titleKey: 'pageTitles.downloads',
      descriptionKey: 'pageDescriptions.downloads',
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
