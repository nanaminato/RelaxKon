import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContentApiService } from '../../core/api/content-api.service';
@Component({ imports: [DatePipe, RouterLink], template: `<section class="page"><div class="container"><p class="eyebrow">Releases</p><h1>Release notes</h1><div class="release-list">@for (release of releases(); track release.version) {<article class="card"><h2>{{ release.title }}</h2><p>{{ release.releaseDate | date }}</p><p>{{ release.summary }}</p><a [routerLink]="['/releases', release.version]">Read release notes →</a></article>}</div></div></section>`, styles: `.release-list{display:grid;gap:1rem;margin-top:2rem}` })
export class ReleasesComponent { private readonly api = inject(ContentApiService); readonly releases = toSignal(this.api.releases(), { initialValue: [] }); }
