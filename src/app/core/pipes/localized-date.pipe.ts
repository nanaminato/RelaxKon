import { Pipe, PipeTransform } from '@angular/core';

/**
 * Locale-aware date pipe.
 *
 * Angular's built-in `DatePipe` uses a fixed `LOCALE_ID` that cannot change at
 * runtime, so it would keep formatting dates for the bootstrap locale even after
 * the visitor switches the site language. This pipe formats through
 * `Intl.DateTimeFormat` using the language passed in, which keeps the output
 * reactive: pass the active language as the last argument so a switch re-renders.
 *
 * Usage: `{{ item.releaseDate | rkDate: 'long' : i18n.language() }}`
 */
@Pipe({ name: 'rkDate' })
export class LocalizedDatePipe implements PipeTransform {
  transform(
    value: string | number | Date | null | undefined,
    style: 'medium' | 'long' = 'medium',
    language?: string,
  ): string {
    if (value === null || value === undefined || value === '') return '';

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    // Release dates are calendar dates (`2026-09-11`), not instants. Format in UTC
    // so the displayed day never shifts with the visitor's timezone offset.
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: style === 'long' ? 'long' : 'short',
      day: 'numeric',
      timeZone: 'UTC',
    };

    try {
      return new Intl.DateTimeFormat(language || 'en-US', options).format(date);
    } catch {
      return date.toISOString().slice(0, 10);
    }
  }
}
