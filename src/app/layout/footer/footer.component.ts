import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { REPOSITORY_ISSUES_URL } from '../../core/config/site-links';
import { I18nService } from '../../core/i18n/i18n.service';
import { GithubLinkComponent } from '../../shared/components/github-link/github-link.component';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, GithubLinkComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly i18n = inject(I18nService);
  readonly issuesUrl = REPOSITORY_ISSUES_URL;
  readonly year = new Date().getFullYear();
}
