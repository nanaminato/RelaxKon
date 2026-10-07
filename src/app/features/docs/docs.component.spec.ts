import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { DocsComponent } from './docs.component';
import { DocumentationApiService } from '../../core/api/documentation-api.service';
import { I18nService, SiteLanguage } from '../../core/i18n/i18n.service';
import { MarkdownService } from '../../core/services/markdown.service';
import { SeoService } from '../../core/seo/seo.service';

describe('Documentation uses the website language', () => {
  it('synchronizes a deep link and labels fallback articles without changing the shell language', async () => {
    const language = signal<SiteLanguage>('zh-CN');
    const setLanguage = vi.fn(async (value: SiteLanguage) => { language.set(value); });
    const seo = { apply: vi.fn() };
    TestBed.configureTestingModule({
      imports: [DocsComponent],
      providers: [provideRouter([]),
        { provide: I18nService, useValue: { language, setLanguage, t: (key: string) => key } },
        { provide: DocumentationApiService, useValue: {
          getLanguages: () => of([{ code: 'en-US', name: 'English' }, { code: 'ja-JP', name: '日本語' }]),
          getVersions: () => of(['latest']), getNavigation: () => of([]),
          getDocument: () => of({ slug: 'apps/terminal', title: 'Terminal', description: 'Terminal guide', content: 'English body', language: 'ja-JP', isFallback: true, headings: [] }),
        } },
        { provide: MarkdownService, useValue: { render: (content: string) => content, headings: () => [] } },
        { provide: SeoService, useValue: seo },
      ],
    });
    vi.spyOn(TestBed.inject(Router), 'url', 'get').mockReturnValue('/docs/ja-JP/latest/apps/terminal#session');
    const fixture = TestBed.createComponent(DocsComponent);
    await fixture.whenStable();
    expect(language()).toBe('ja-JP');
    expect(fixture.componentInstance.fallbackLanguageName()).toBe('English');
    expect(fixture.nativeElement.querySelector('article').getAttribute('lang')).toBe('en-US');
    expect(fixture.nativeElement.querySelector('.switchers')).toBeNull();
    expect(seo.apply).toHaveBeenLastCalledWith(expect.objectContaining({ language: 'en-US', noindex: true, path: '/docs/ja-JP/latest/apps/terminal' }));
  });
});
