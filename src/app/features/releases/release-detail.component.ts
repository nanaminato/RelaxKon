import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { ContentApiService } from '../../core/api/content-api.service';
import { MarkdownService } from '../../core/services/markdown.service';
@Component({ imports: [RouterLink], template: `<section class="page"><div class="container">@if (release(); as item) {<a routerLink="/releases">← All releases</a><article class="markdown" [innerHTML]="markdown.render(item.content)"></article>} @else {<p>Loading release…</p>}</div></section>` })
export class ReleaseDetailComponent { private readonly route = inject(ActivatedRoute); private readonly api = inject(ContentApiService); readonly markdown = inject(MarkdownService); readonly release = toSignal(this.route.paramMap.pipe(switchMap(params => this.api.release(params.get('version') ?? 'preview')))); }
