import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { ReleasesComponent } from './releases.component';
import { ReleaseDetailComponent } from './release-detail.component';
import { I18nService, SiteLanguage } from '../../core/i18n/i18n.service';
import { SeoService } from '../../core/seo/seo.service';
import { MarkdownService } from '../../core/services/markdown.service';
import { API_BASE_URL } from '../../core/config/api-base-url.token';

describe('Release language selection', () => {
  function configure() {
    const language = signal<SiteLanguage>('zh-CN');
    const contentLanguage = signal<string | null>(null);
    const seo = { apply: vi.fn() };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map([['version', '0.1.2']]) } } },
        { provide: I18nService, useValue: { language, t: (key: string) => key, setContentLanguage: (value: string | null) => contentLanguage.set(value) } },
        { provide: SeoService, useValue: seo },
        { provide: MarkdownService, useValue: { render: (content: string) => content } },
      ],
    });
    return { language, contentLanguage, seo, http: TestBed.inject(HttpTestingController) };
  }

  it('cancels the old list request when the selected language changes', async () => {
    const { language, http } = configure();
    const fixture = TestBed.createComponent(ReleasesComponent);
    fixture.detectChanges();
    const old = http.expectOne('/api/releases?language=zh-CN');
    language.set('ja-JP');
    fixture.detectChanges();
    expect(old.cancelled).toBe(true);
    http.expectOne('/api/releases?language=ja-JP').flush([]);
    await fixture.whenStable();
    expect(fixture.componentInstance.loading()).toBe(false);
    http.verify();
  });

  it('switches detail requests and marks English fallback content and SEO correctly', async () => {
    const { language, contentLanguage, seo, http } = configure();
    const fixture = TestBed.createComponent(ReleaseDetailComponent);
    fixture.detectChanges();
    const old = http.expectOne('/api/releases/0.1.2?language=zh-CN');
    language.set('ja-JP');
    fixture.detectChanges();
    expect(old.cancelled).toBe(true);
    http.expectOne('/api/releases/0.1.2?language=ja-JP').flush({
      version: '0.1.2', title: 'English release', summary: 'English summary',
      releaseDate: '2026-09-16', isPrerelease: false, language: 'en-US',
      isFallback: true, content: 'English body', highlights: [],
    });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('releases.fallbackNotice');
    expect(fixture.nativeElement.querySelector('article').getAttribute('lang')).toBe('en-US');
    expect(contentLanguage()).toBe('en-US');
    expect(seo.apply).toHaveBeenLastCalledWith(expect.objectContaining({ description: 'English summary' }));
    fixture.destroy();
    expect(contentLanguage()).toBeNull();
    http.verify();
  });
});
