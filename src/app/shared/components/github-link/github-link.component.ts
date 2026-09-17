import { Component, inject, input, output } from '@angular/core';
import { REPOSITORY_URL } from '../../../core/config/site-links';
import { I18nService } from '../../../core/i18n/i18n.service';

/**
 * Presentation of the link. `nav` matches the header/footer text links,
 * `primary`/`secondary` reuse the site button classes from `styles.scss`,
 * `inline` sits inside prose.
 */
export type GithubLinkVariant = 'nav' | 'primary' | 'secondary' | 'inline';

/** Mirrors the `btn--sm` / `btn--lg` modifiers of the site button scale. */
export type GithubLinkSize = 'sm' | 'md' | 'lg';

/**
 * Single external call-to-action for the project repository.
 *
 * It is a component rather than repeated markup so that every entry point
 * shares one URL, one i18n label and one set of external-link attributes
 * (`target="_blank"` plus `rel="noopener noreferrer"`).
 */
@Component({
  selector: 'app-github-link',
  templateUrl: './github-link.component.html',
  styleUrl: './github-link.component.scss',
})
export class GithubLinkComponent {
  readonly i18n = inject(I18nService);
  readonly url = REPOSITORY_URL;

  readonly variant = input<GithubLinkVariant>('nav');
  /** Button scale, only meaningful for the `primary` and `secondary` variants. */
  readonly size = input<GithubLinkSize>('md');
  /** Keeps only the mark, for rows that are already dense. */
  readonly iconOnly = input(false);
  /** Which dictionary entry supplies the visible label. */
  readonly labelKey = input('github.cta');
  /** Keeps the mark but drops the `↗` affordance used next to button labels. */
  readonly showExternalMark = input(true);
  /** Raised on activation so a host can dismiss its own overlay or drawer. */
  readonly navigated = output<void>();

  onClick(): void {
    this.navigated.emit();
  }
}
