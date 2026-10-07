import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { I18nService, SiteLanguage } from '../i18n/i18n.service';

export interface PageMeta {
  title?: string;
  titleKey?: string;
  titleParams?: Record<string, string | number>;
  description?: string;
  descriptionKey?: string;
  descriptionParams?: Record<string, string | number>;
  path?: string;
  /** Root-relative or absolute share image; defaults to the site-wide card. */
  image?: string;
  language?: SiteLanguage;
  noindex?: boolean;
  software?: readonly { version: string; platform: string; url: string }[];
}

const SITE_ORIGIN = 'https://relaxkon.com';

/** 1200×630 site card, used by every page unless one passes its own `image`. */
const DEFAULT_SHARE_IMAGE = '/og-image.png';
const SHARE_IMAGE_WIDTH = '1200';
const SHARE_IMAGE_HEIGHT = '630';

/** `og:locale` wants `language_TERRITORY`, which the site language codes already are. */
const OG_LOCALES: Record<SiteLanguage, string> = {
  'en-US': 'en_US',
  'zh-CN': 'zh_CN',
  'ja-JP': 'ja_JP',
};

/**
 * Keeps the document head in sync with the active route: page title,
 * meta description, canonical link, Open Graph — including the share card —
 * and Twitter card basics.
 *
 * Titles and descriptions are resolved through the i18n service inside the
 * effect below, so switching the UI language refreshes the head too. A literal
 * `description` is only used by pages whose text comes from content.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly origin = SITE_ORIGIN;

  private readonly i18n = inject(I18nService);
  private readonly page = signal<PageMeta | null>(null);

  constructor() {
    effect(() => {
      const page = this.page();
      if (page) this.update(page);
    });
  }

  apply(page: PageMeta): void {
    this.page.set(page);
    this.update(page);
  }

  private update(page: PageMeta): void {
    const title = page.titleKey ? this.i18n.t(page.titleKey, page.titleParams) : page.title ?? 'RelaxKon';
    const description = page.descriptionKey
      ? this.i18n.t(page.descriptionKey, page.descriptionParams)
      : page.description;
    const url = this.canonicalUrl(page.path);
    const image = this.shareImageUrl(page.image);
    const language = page.language ?? this.i18n.language();

    this.title.setTitle(title);
    this.setMeta('name', 'description', description);
    this.setMeta('name', 'robots', page.noindex ? 'noindex, follow' : 'index, follow');

    this.setMeta('property', 'og:type', 'website');
    this.setMeta('property', 'og:site_name', 'RelaxKon');
    this.setMeta('property', 'og:url', url);
    this.setMeta('property', 'og:title', title);
    this.setMeta('property', 'og:description', description);
    this.setMeta('property', 'og:image', image);
    this.setMeta('property', 'og:image:width', SHARE_IMAGE_WIDTH);
    this.setMeta('property', 'og:image:height', SHARE_IMAGE_HEIGHT);
    this.setMeta('property', 'og:image:alt', title);
    this.setMeta('property', 'og:locale', OG_LOCALES[language]);
    this.setAlternateLocales(language);

    this.setMeta('name', 'twitter:card', 'summary_large_image');
    this.setMeta('name', 'twitter:title', title);
    this.setMeta('name', 'twitter:description', description);
    this.setMeta('name', 'twitter:image', image);
    this.setMeta('name', 'twitter:image:alt', title);

    this.setCanonical(url);
    this.setLanguageAlternates(page.noindex ? undefined : page.path);
    this.setStructuredData(page, title, description, url, language);
  }

  private setMeta(attribute: 'name' | 'property', key: string, value?: string): void {
    if (!value) { this.meta.removeTag(`${attribute}="${key}"`); return; }
    this.meta.updateTag({ [attribute]: key, content: value });
  }

  /**
   * `og:locale:alternate` repeats once per other language, but `Meta.updateTag`
   * matches on the selector alone — it would keep rewriting a single node — so
   * the alternates are managed directly.
   */
  private setAlternateLocales(current: SiteLanguage): void {
    this.document.head
      .querySelectorAll('meta[property="og:locale:alternate"]')
      .forEach(node => node.remove());
    for (const [code, locale] of Object.entries(OG_LOCALES)) {
      if (code === current) continue;
      const meta = this.document.createElement('meta');
      meta.setAttribute('property', 'og:locale:alternate');
      meta.setAttribute('content', locale);
      this.document.head.appendChild(meta);
    }
  }

  private canonicalUrl(path?: string): string {
    return `${this.origin}${new URL(path ?? this.document.location?.pathname ?? '/', this.origin).pathname}`;
  }

  /** Only documentation has distinct, crawlable URLs for each language. */
  private setLanguageAlternates(path?: string): void {
    this.document.head.querySelectorAll('link[data-rk-hreflang]').forEach(node => node.remove());
    const match = path?.split(/[?#]/)[0].match(/^\/docs\/(en-US|zh-CN|ja-JP)\/(.+)$/);
    if (!match) return;
    for (const language of [...Object.keys(OG_LOCALES), 'x-default']) {
      const link = this.document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = language;
      link.href = `${this.origin}/docs/${language === 'x-default' ? 'en-US' : language}/${match[2]}`;
      link.setAttribute('data-rk-hreflang', '');
      this.document.head.appendChild(link);
    }
  }

  private setStructuredData(page: PageMeta, title: string, description: string | undefined, url: string, language: SiteLanguage): void {
    this.document.head.querySelector('#rk-structured-data')?.remove();
    if (page.noindex) return;
    const graph: Record<string, unknown>[] = [
      { '@type': 'Organization', '@id': `${this.origin}/#organization`, name: 'RelaxKon', url: this.origin, logo: `${this.origin}/brand-mark.png`, sameAs: ['https://github.com/nanaminato/RelaxKonOS'] },
      { '@type': 'WebSite', '@id': `${this.origin}/#website`, name: 'RelaxKon', url: this.origin, publisher: { '@id': `${this.origin}/#organization` } },
      { '@type': 'WebPage', '@id': `${url}#webpage`, name: title, description, url, inLanguage: language, isPartOf: { '@id': `${this.origin}/#website` } },
    ];
    for (const item of page.software ?? []) {
      graph.push({ '@type': 'SoftwareApplication', name: 'RelaxKonOS', applicationCategory: 'DeveloperApplication', operatingSystem: item.platform, softwareVersion: item.version, downloadUrl: new URL(item.url, this.origin).href, publisher: { '@id': `${this.origin}/#organization` } });
    }
    const script = this.document.createElement('script');
    script.id = 'rk-structured-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
    this.document.head.appendChild(script);
  }

  private shareImageUrl(image?: string): string {
    const value = image ?? DEFAULT_SHARE_IMAGE;
    return /^https?:\/\//i.test(value) ? value : `${this.origin}${value}`;
  }

  private setCanonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
