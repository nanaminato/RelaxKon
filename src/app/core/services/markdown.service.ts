import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MarkdownService {
  render(source: string): string {
    const escaped = source.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const blocks = escaped.split(/\n{2,}/).map(block => this.block(block.trim())).filter(Boolean);
    return blocks.join('\n');
  }
  headings(source: string) { return [...source.matchAll(/^#{2,3}\s+(.+)$/gm)].map(match => ({ level: match[0].startsWith('###') ? 3 : 2, text: match[1], id: this.id(match[1]) })); }
  private block(block: string): string {
    if (!block) return '';
    if (block.startsWith('```')) return `<pre><code>${block.replace(/^```\w*\n?|```$/g, '')}</code></pre>`;
    const heading = /^(#{1,6})\s+(.+)$/.exec(block); if (heading) { const level = heading[1].length; return `<h${level} id="${this.id(heading[2])}">${this.inline(heading[2])}</h${level}>`; }
    if (block.startsWith('&gt;')) return `<blockquote>${this.inline(block.replace(/^&gt;\s?/gm, '').replace(/\n/g, ' '))}</blockquote>`;
    if (/^-\s+/m.test(block)) return `<ul>${block.split('\n').map(line => `<li>${this.inline(line.replace(/^-\s+/, ''))}</li>`).join('')}</ul>`;
    return `<p>${this.inline(block.replace(/\n/g, ' '))}</p>`;
  }
  private inline(value: string): string { return value.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>'); }
  private id(text: string) { return text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/(^-|-$)/g, ''); }
}
