import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DownloadsComponent } from './downloads.component';
import { ContentApiService } from '../../core/api/content-api.service';
import { I18nService, SiteLanguage } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';
import { DownloadInfo } from '../../core/models/content.models';

const artifact = (overrides: Partial<DownloadInfo> = {}): DownloadInfo => ({
  platform: 'windows', architecture: 'x64', version: '0.1.2',
  url: '/relaxkonos/stable/0.1.2/client.zip', size: '1 MB', checksum: 'abc',
  releaseDate: '2026-09-16', isAvailable: true, fileName: 'client.zip',
  packageKind: 'client', ...overrides,
});

describe('Downloads package guidance', () => {
  const language = signal<SiteLanguage>('zh-CN');
  async function render(items: DownloadInfo[]) {
    TestBed.configureTestingModule({
      imports: [DownloadsComponent],
      providers: [provideRouter([]),
        { provide: ContentApiService, useValue: { downloads: () => of(items) } },
        { provide: I18nService, useValue: { language, t: (key: string) => key } },
        { provide: SeoService, useValue: { apply: () => {} } },
      ],
    });
    const fixture = TestBed.createComponent(DownloadsComponent);
    await fixture.whenStable();
    return fixture;
  }

  it('renders APK guidance without a desktop extraction command', async () => {
    const apk = artifact({ platform: 'android', architecture: 'universal', fileName: 'mobile.apk' });
    const fixture = await render([apk]);
    const card = fixture.nativeElement.querySelector('.download') as HTMLElement;
    expect(card.textContent).toContain('downloads.androidHint');
    expect(card.querySelector('.client-run')).toBeNull();
    expect(card.querySelector('a[href="/docs/zh-CN/latest/getting-started/android"]')).toBeTruthy();
    expect(fixture.componentInstance.clientLaunchCommand(apk)).toBe('');
    expect(fixture.nativeElement.textContent).not.toContain('downloads.androidUnavailable');
  });

  it('does not advertise unavailable APKs as published', async () => {
    const fixture = await render([artifact({ platform: 'android', fileName: 'mobile.apk', isAvailable: false })]);
    expect(fixture.componentInstance.androidItems()).toHaveLength(0);
    expect(fixture.nativeElement.textContent).toContain('downloads.androidUnavailable');
    expect(fixture.nativeElement.querySelector('.download a[download]')).toBeNull();
  });

  it('distinguishes a user server from a system server bundle', async () => {
    const fixture = await render([artifact({ platform: 'linux', packageKind: 'user-server', fileName: 'user-server.zip' })]);
    expect(fixture.componentInstance.userModeItems()).toHaveLength(1);
    expect(fixture.nativeElement.textContent).toContain('downloads.packageKind.user-server');
    expect(fixture.nativeElement.textContent).not.toContain('downloads.userMode.unavailable');
    expect(fixture.nativeElement.querySelector('.download .client-run')).toBeNull();
  });

  it('retains Windows and Linux desktop commands but does not invent macOS commands', async () => {
    const fixture = await render([artifact()]);
    expect(fixture.nativeElement.querySelector('.download .client-run')).toBeTruthy();
    const component = fixture.componentInstance;
    expect(component.clientLaunchCommand(artifact())).toContain('RelaxKonOS.Client.Desktop.exe');
    expect(component.clientLaunchCommand(artifact({ platform: 'linux' }))).toContain('payload/linux/client/');
    expect(component.clientLaunchCommand(artifact({ platform: 'macos' }))).toBe('');
    expect(fixture.nativeElement.textContent).toContain('downloads.userMode.unavailable');
  });
});
