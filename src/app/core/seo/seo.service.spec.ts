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
        language: signal('en-US'),
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

  it('adds document language alternates and strips query strings and fragments from the canonical', () => {
    TestBed.configureTestingModule({ providers: [{ provide: I18nService, useValue: { t: (key: string) => key, language: signal('zh-CN') } }] });
    const seo = TestBed.inject(SeoService);
    seo.apply({ title: '安装', description: '安装指南', path: '/docs/zh-CN/latest/getting-started/installation?source=download#linux' });
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://relaxkon.com/docs/zh-CN/latest/getting-started/installation');
    expect(document.querySelectorAll('link[data-rk-hreflang]')).toHaveLength(4);
    expect(document.querySelector('link[hreflang="ja-JP"]')?.getAttribute('href')).toBe('https://relaxkon.com/docs/ja-JP/latest/getting-started/installation');
    seo.apply({ title: 'Downloads', path: '/downloads' });
    expect(document.querySelectorAll('link[data-rk-hreflang]')).toHaveLength(0);
    expect(document.querySelector('meta[name="description"]')).toBeNull();
  });

  it('clears structured data on missing pages and resets noindex on the next valid page', () => {
    TestBed.configureTestingModule({ providers: [{ provide: I18nService, useValue: { t: (key: string) => key, language: signal('en-US') } }] });
    const seo = TestBed.inject(SeoService);
    seo.apply({ title: 'Download', path: '/downloads', software: [{ version: '0.2.0', platform: 'Windows', url: '/new-client.zip' }] });
    const data = JSON.parse(document.querySelector('#rk-structured-data')!.textContent!);
    expect(data['@graph'].find((item: Record<string, string>) => item['@type'] === 'SoftwareApplication')).toEqual(expect.objectContaining({ softwareVersion: '0.2.0', downloadUrl: 'https://relaxkon.com/new-client.zip' }));
    seo.apply({ title: 'Missing', noindex: true });
    expect(document.querySelector('#rk-structured-data')).toBeNull();
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow');
    seo.apply({ title: 'Home', path: '/' });
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('index, follow');
  });
});
