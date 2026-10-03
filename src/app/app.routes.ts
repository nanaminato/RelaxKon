import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { I18nService } from './core/i18n/i18n.service';

/**
 * `/docs` has no language in the URL, so send visitors to the documentation in
 * the language they are already reading the site in instead of always English.
 */
const docsEntry = (): string => {
  const language = inject(I18nService).language();
  return `/docs/${language}/latest/getting-started/introduction`;
};

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent),
  },
  {
    path: 'products/relaxkonos',
    loadComponent: () => import('./features/relaxkonos/relaxkonos.component').then(m => m.RelaxKonOsComponent),
  },
  {
    path: 'docs',
    pathMatch: 'full',
    redirectTo: docsEntry,
  },
  {
    path: 'docs/:language/:version/**',
    loadComponent: () => import('./features/docs/docs.component').then(m => m.DocsComponent),
  },
  {
    path: 'downloads',
    loadComponent: () => import('./features/downloads/downloads.component').then(m => m.DownloadsComponent),
  },
  {
    path: 'releases',
    loadComponent: () => import('./features/releases/releases.component').then(m => m.ReleasesComponent),
  },
  {
    path: 'releases/:version',
    loadComponent: () => import('./features/releases/release-detail.component').then(m => m.ReleaseDetailComponent),
  },
  {
    path: 'faq',
    loadComponent: () => import('./features/faq/faq.component').then(m => m.FaqComponent),
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent),
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
