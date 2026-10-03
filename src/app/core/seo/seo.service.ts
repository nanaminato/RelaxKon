import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { I18nService } from '../i18n/i18n.service';

export interface PageMeta {
  title?: string;
  titleKey?: string;
  titleParams?: Record<string, string | number>;
  description?: string;
  path?: string;
}

/**
 * Keeps the document head in sync with the active route: page title,
 * meta description, canonical link and Open Graph basics.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly origin = 'https://relaxkon.com';

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
    this.title.setTitle(title);
    this.setMeta('name', 'description', page.description);
    this.setMeta('property', 'og:title', title);
    this.setMeta('property', 'og:description', page.description);
    this.setMeta('property', 'og:type', 'website');
    this.setMeta('property', 'og:site_name', 'RelaxKon');
    this.setMeta('name', 'twitter:card', 'summary_large_image');
    this.setMeta('name', 'twitter:title', title);
    this.setMeta('name', 'twitter:description', page.description);
    this.setCanonical(page.path);
  }

  private setMeta(attribute: 'name' | 'property', key: string, value?: string): void {
    if (!value) return;
    this.meta.updateTag({ [attribute]: key, content: value });
  }

  private setCanonical(path?: string): void {
    const url = `${this.origin}${path ?? this.document.location?.pathname ?? '/'}`;
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
