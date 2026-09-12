import { Injectable } from '@angular/core';
import { DocumentHeading } from '../models/content.models';

export interface MarkdownLabels {
  copy?: string;
  copied?: string;
}

const FENCE = /^(```|~~~)\s*([\w+#-]*)\s*$/;
const HEADING = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const HR = /^\s{0,3}(?:([-*_])\s*){3,}$/;
const UL = /^(\s*)([-*+])\s+(.*)$/;
const OL = /^(\s*)(\d+)[.)]\s+(.*)$/;
const TABLE_DIVIDER = /^\s*\|?[\s:-]*-[\s|:-]*\|?\s*$/;

/**
 * Small, dependency-free Markdown renderer for documentation pages.
 *
 * Design notes:
 * - Output is generated from a whitelist of block and inline structures, so raw
 *   HTML in the source is escaped rather than trusted (XSS hardening).
 * - Heading identifiers are derived with the same normalisation used by the
 *   table of contents, guaranteeing anchors always resolve.
 */
@Injectable({ providedIn: 'root' })
export class MarkdownService {
  render(source: string, labels: MarkdownLabels = {}): string {
    const lines = source.replace(/\r\n?/g, '\n').split('\n');
    const html: string[] = [];
    let index = 0;

    while (index < lines.length) {
      const line = lines[index];

      if (!line.trim()) {
        index += 1;
        continue;
      }

      const fence = FENCE.exec(line);
      if (fence) {
        const body: string[] = [];
        index += 1;
        while (index < lines.length && !FENCE.test(lines[index])) {
          body.push(lines[index]);
          index += 1;
        }
        index += 1;
        html.push(this.codeBlock(body.join('\n'), fence[2], labels));
        continue;
      }

      if (HEADING.test(line)) {
        const match = HEADING.exec(line)!;
        const level = match[1].length;
        const text = match[2];
        html.push(`<h${level} id="${this.slug(text)}">${this.inline(text)}</h${level}>`);
        index += 1;
        continue;
      }

      if (HR.test(line)) {
        html.push('<hr />');
        index += 1;
        continue;
      }

      if (line.includes('|') && index + 1 < lines.length && TABLE_DIVIDER.test(lines[index + 1])) {
        const table = this.table(lines, index);
        html.push(table.html);
        index = table.next;
        continue;
      }

      if (/^\s*>/.test(line)) {
        const quote: string[] = [];
        while (index < lines.length && /^\s*>/.test(lines[index])) {
          quote.push(lines[index].replace(/^\s*>\s?/, ''));
          index += 1;
        }
        html.push(this.blockquote(quote.join('\n')));
        continue;
      }

      if (UL.test(line) || OL.test(line)) {
        const list = this.list(lines, index);
        html.push(list.html);
        index = list.next;
        continue;
      }

      const paragraph: string[] = [];
      while (
        index < lines.length &&
        lines[index].trim() &&
        !FENCE.test(lines[index]) &&
        !HEADING.test(lines[index]) &&
        !HR.test(lines[index]) &&
        !UL.test(lines[index]) &&
        !OL.test(lines[index]) &&
        !/^\s*>/.test(lines[index])
      ) {
        paragraph.push(lines[index].trim());
        index += 1;
      }
      if (paragraph.length) html.push(`<p>${this.inline(paragraph.join(' '))}</p>`);
    }

    return html.join('\n');
  }

  /** Collects the table of contents from H1–H3 headings, matching `render` identifiers. */
  headings(source: string): DocumentHeading[] {
    return source
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map(line => HEADING.exec(line))
      .filter((match): match is RegExpExecArray => match !== null && match[1].length <= 3)
      .map(match => ({ id: this.slug(match[2]), text: this.stripInline(match[2]), level: match[1].length }));
  }

  // ------------------------------------------------------------- blocks ----

  private codeBlock(code: string, language: string, labels: MarkdownLabels): string {
    const copyLabel = labels.copy ?? 'Copy';
    const copiedLabel = labels.copied ?? 'Copied';
    const attribute = language ? ` class="language-${this.escape(language)}"` : '';
    return (
      `<div class="code-block"><button class="code-block__copy" type="button" data-copy` +
      ` data-copied="${this.escape(copiedLabel)}">${this.escape(copyLabel)}</button>` +
      `<pre><code${attribute}>${this.escape(code)}</code></pre></div>`
    );
  }

  private blockquote(text: string): string {
    const normalized = text.replace(/\n/g, ' ').trim();
    const kind = /^(\*\*|\[!)(warning|caution|注意|警告)/i.test(normalized)
      ? ' is-warning'
      : /^(\*\*|\[!)(tip|note|提示|注意事項)/i.test(normalized)
        ? ' is-tip'
        : '';
    const cleaned = normalized
      .replace(/^\[\!(warning|caution|tip|note)\]\s*/i, '')
      .replace(/^(warning|caution|tip|note)\s*[:：]\s*/i, '');
    return `<blockquote${kind}><p>${this.inline(cleaned)}</p></blockquote>`;
  }

  private table(lines: string[], start: number): { html: string; next: number } {
    const parseRow = (row: string) =>
      row
        .replace(/^\s*\|/, '')
        .replace(/\|\s*$/, '')
        .split('|')
        .map(cell => cell.trim());

    const head = parseRow(lines[start]);
    let index = start + 2;
    const body: string[][] = [];
    while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
      body.push(parseRow(lines[index]));
      index += 1;
    }

    const headHtml = head.map(cell => `<th>${this.inline(cell)}</th>`).join('');
    const bodyHtml = body
      .map(row => `<tr>${row.map(cell => `<td>${this.inline(cell)}</td>`).join('')}</tr>`)
      .join('');

    return {
      html: `<div class="table-wrap"><table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`,
      next: index,
    };
  }

  private list(lines: string[], start: number): { html: string; next: number } {
    const ordered = OL.test(lines[start]);
    const pattern = ordered ? OL : UL;
    const items: string[] = [];
    let index = start;

    while (index < lines.length && pattern.test(lines[index])) {
      const match = pattern.exec(lines[index])!;
      items.push(this.inline(match[3]));
      index += 1;
      // Continuation lines belonging to the current item.
      while (index < lines.length && lines[index].trim() && !pattern.test(lines[index]) && !UL.test(lines[index]) && !OL.test(lines[index])) {
        items[items.length - 1] += ` ${this.inline(lines[index].trim())}`;
        index += 1;
      }
    }

    const tag = ordered ? 'ol' : 'ul';
    return { html: `<${tag}>${items.map(item => `<li>${item}</li>`).join('')}</${tag}>`, next: index };
  }

  // ------------------------------------------------------------ inline ----

  private inline(text: string): string {
    const codeSpans: string[] = [];
    let escaped = this.escape(text).replace(/`([^`]+)`/g, (_match, code: string) => {
      codeSpans.push(`<code>${code}</code>`);
      return `\u0000${codeSpans.length - 1}\u0000`;
    });

    escaped = escaped
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt: string, src: string) => `<img src="${src}" alt="${alt}" loading="lazy" />`)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, href: string) => {
        const external = /^https?:\/\//i.test(href);
        const attributes = external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${href}"${attributes}>${label}</a>`;
      })
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(])\*([^*\n]+)\*(?=[\s).,!?:;]|$)/g, '$1<em>$2</em>')
      .replace(/~~([^~]+)~~/g, '<del>$1</del>');

    return escaped.replace(/\u0000(\d+)\u0000/g, (_m, i: string) => codeSpans[Number(i)]);
  }

  private escape(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private slug(text: string): string {
    return this.stripInline(text)
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private stripInline(text: string): string {
    return text
      .replace(/`([^`]+)`/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/~~([^~]+)~~/g, '$1')
      .trim();
  }
}
