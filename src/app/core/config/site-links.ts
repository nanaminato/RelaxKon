/**
 * Destinations that are not served by the content API.
 *
 * Every place that links out to the project repository (header, home hero,
 * footer, downloads and about) reads the URL from here, so the address can
 * never drift between pages.
 */
export const REPOSITORY_URL = 'https://github.com/nanaminato/RelaxKonOS';

/** Issue tracker of the same repository, for bug reports and feature requests. */
export const REPOSITORY_ISSUES_URL = `${REPOSITORY_URL}/issues`;

/**
 * Maintainer contact address, for licensing and partnership enquiries.
 *
 * Used as the link text itself, so it reads identically in every UI language;
 * the `mailto:` URL is derived here rather than written once per page.
 */
export const CONTACT_EMAIL = 'wangcx@relaxkon.com';

/** `mailto:` target of {@link CONTACT_EMAIL}. */
export const CONTACT_EMAIL_URL = `mailto:${CONTACT_EMAIL}`;
