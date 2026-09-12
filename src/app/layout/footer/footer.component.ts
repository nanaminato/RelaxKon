import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({ selector: 'app-footer', imports: [RouterLink], template: `<footer><div class="container"><strong>RelaxKon</strong><span>Desktops beyond devices.</span><nav><a routerLink="/docs">Documentation</a><a routerLink="/faq">FAQ</a><a routerLink="/about">About</a></nav></div></footer>`, styles: `footer{border-top:1px solid var(--rk-border);padding:1.6rem 0;color:var(--rk-text-secondary);font-size:.9rem}footer .container{display:flex;gap:1rem;align-items:center}footer strong{color:var(--rk-text)}footer nav{margin-left:auto;display:flex;gap:1rem}@media(max-width:560px){footer .container{flex-wrap:wrap}footer nav{margin-left:0;width:100%}}` })
export class FooterComponent {}
