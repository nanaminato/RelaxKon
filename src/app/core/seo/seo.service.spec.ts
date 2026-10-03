import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { I18nService } from '../i18n/i18n.service';
import { SeoService } from './seo.service';

describe('SeoService localized titles', () => {
  it('updates the browser and social titles when the dictionary changes', () => {
    const messages = signal<Record<string, string>>({ 'pageTitles.about': 'About — RelaxKon' });
    TestBed.configureTestingModule({
      providers: [{ provide: I18nService, useValue: {
        t: (key: string) => messages()[key] ?? key,
      } }],
    });
    const seo = TestBed.inject(SeoService);
    seo.apply({ titleKey: 'pageTitles.about', path: '/about' });
    TestBed.tick();
    expect(TestBed.inject(Title).getTitle()).toBe('About — RelaxKon');
    messages.set({ 'pageTitles.about': '关于 — RelaxKon' });
    TestBed.tick();
    expect(TestBed.inject(Title).getTitle()).toBe('关于 — RelaxKon');
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('关于 — RelaxKon');
    expect(document.querySelector('meta[name="twitter:title"]')?.getAttribute('content')).toBe('关于 — RelaxKon');
    seo.apply({ title: 'Another page — RelaxKon' });
    messages.set({ 'pageTitles.about': '概要 — RelaxKon' });
    TestBed.tick();
    expect(TestBed.inject(Title).getTitle()).toBe('Another page — RelaxKon');
  });
});
