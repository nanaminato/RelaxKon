import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContentApiService } from '../../core/api/content-api.service';
@Component({ imports: [DatePipe], template: `<section class="page"><div class="container"><p class="eyebrow">Downloads</p><h1>Product downloads</h1><p class="lead">Release artifacts will appear here as they become available.</p><div class="card-grid downloads">@for (item of items(); track item.platform) {<article class="card"><h2>{{ item.platform }}</h2><p>{{ item.architecture }} · {{ item.version }}</p><p>Release date: {{ item.releaseDate | date }}</p><button class="button secondary" [disabled]="!item.isAvailable">{{ item.isAvailable ? 'Download' : 'Coming soon' }}</button></article>}</div></div></section>`, styles: `.downloads{margin-top:2rem}button:disabled{opacity:.55;cursor:not-allowed}` })
export class DownloadsComponent { private readonly api = inject(ContentApiService); readonly items = toSignal(this.api.downloads(), { initialValue: [] }); }
