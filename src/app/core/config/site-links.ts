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
