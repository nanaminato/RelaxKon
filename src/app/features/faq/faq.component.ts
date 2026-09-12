import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContentApiService } from '../../core/api/content-api.service';
@Component({ template: `<section class="page"><div class="container"><p class="eyebrow">FAQ</p><h1>Frequently asked questions</h1><div class="faq">@for (item of items(); track item.order) {<details class="card"><summary>{{ item.question }}</summary><p>{{ item.answer }}</p></details>}</div></div></section>`, styles: `.faq{display:grid;gap:.8rem;margin-top:2rem}summary{font-weight:750;cursor:pointer}details p{margin-bottom:0;color:var(--rk-text-secondary)}` })
export class FaqComponent { private readonly api = inject(ContentApiService); readonly items = toSignal(this.api.faq(), { initialValue: [] }); }
