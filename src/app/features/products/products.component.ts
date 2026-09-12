import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({ imports: [RouterLink], template: `<section class="page"><div class="container"><p class="eyebrow">Products</p><h1>Workspace software with a clear architectural center.</h1><p class="lead">RelaxKon products are designed around state, local interaction, and durable remote capabilities.</p><div class="card-grid products"><article class="card"><h2>RelaxKonOS</h2><p>A cross-platform, cloud-native desktop operating environment built around local UI rendering and managed workspaces.</p><a routerLink="/products/relaxkonos">Explore RelaxKonOS →</a></article></div></div></section>`, styles: `.products{margin-top:2rem;grid-template-columns:minmax(0,420px)}` })
export class ProductsComponent {}
