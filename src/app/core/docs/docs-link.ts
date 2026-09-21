import { SiteLanguage } from '../i18n/i18n.service';

/** Slug shown when a documentation link has no specific target. */
export const DOCS_ENTRY_SLUG = 'getting-started/introduction';

/**
 * Builds a documentation URL in the language the visitor is reading the site in.
 *
 * Documentation routes are language-first (`/docs/<language>/<version>/<slug>`)
 * and the server falls back to English only when an article is untranslated.
 * Hard-coding `en-US` would therefore send a Chinese or Japanese visitor to
 * English pages even though the same articles exist in their own language.
 */
export function docsUrl(language: SiteLanguage, slug: string): string {
  return `/docs/${language}/latest/${slug}`;
}
