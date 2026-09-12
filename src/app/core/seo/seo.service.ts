import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface PageMeta {
  title: string;
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

  apply(page: PageMeta): void {
    this.title.setTitle(page.title);
    this.setMeta('name', 'description', page.description);
    this.setMeta('property', 'og:title', page.title);
    this.setMeta('property', 'og:description', page.description);
    this.setMeta('property', 'og:type', 'website');
    this.setMeta('property', 'og:site_name', 'RelaxKon');
    this.setMeta('name', 'twitter:card', 'summary_large_image');
    this.setMeta('name', 'twitter:title', page.title);
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
