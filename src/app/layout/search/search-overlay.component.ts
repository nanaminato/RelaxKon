import { Component, DestroyRef, ElementRef, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { DocumentationApiService } from '../../core/api/documentation-api.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { SearchResult } from '../../core/models/content.models';

@Component({
  selector: 'app-search-overlay',
  imports: [FormsModule],
  template: `
    @if (open()) {
      <div class="overlay" role="dialog" aria-modal="true" [attr.aria-label]="i18n.t('search.title')" (click)="close()">
        <div class="panel" (click)="$event.stopPropagation()">
          <div class="panel__input">
            <span class="panel__icon" aria-hidden="true">⌕</span>
            <input
              #searchInput
              type="search"
              [placeholder]="i18n.t('search.placeholder')"
              [ngModel]="query()"
              (ngModelChange)="onQuery($event)"
              (keydown)="onKeydown($event)"
              autocomplete="off"
              spellcheck="false"
            />
            <button class="panel__close" type="button" (click)="close()" [attr.aria-label]="i18n.t('search.close')">esc</button>
          </div>

          <div class="panel__body">
            @if (query().trim().length < 2) {
              <p class="panel__state">{{ i18n.t('search.prompt') }} <span class="muted">{{ i18n.t('search.hint') }}</span></p>
            } @else if (loading()) {
              <p class="panel__state">{{ i18n.t('common.loading') }}</p>
            } @else if (!results().length) {
              <p class="panel__state">{{ i18n.t('search.empty', { query: query() }) }}</p>
            } @else {
              <p class="panel__count">{{ i18n.t('search.results', { count: results().length }) }}</p>
              <ul class="results">
                @for (item of results(); track item.slug; let index = $index) {
                  <li>
                    <button type="button" class="result" [class.is-active]="index === active()" (mouseenter)="active.set(index)" (click)="go(item)">
                      <span class="result__head">
                        <strong>{{ item.title }}</strong>
                        <span class="badge">{{ item.category }}</span>
                      </span>
                      <span class="result__snippet">{{ item.snippet }}</span>
                      <span class="result__meta mono">{{ item.language }} · {{ item.version }}</span>
                    </button>
                  </li>
                }
              </ul>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .overlay {
        position: fixed;
        inset: 0;
        z-index: 200;
        display: flex;
        justify-content: center;
        padding: clamp(1rem, 8vh, 6rem) 1rem 2rem;
        background: var(--rk-overlay);
        backdrop-filter: blur(3px);
      }
      .panel {
        display: flex;
        flex-direction: column;
        width: min(680px, 100%);
        max-height: 76vh;
        overflow: hidden;
        border: 1px solid var(--rk-border);
        border-radius: var(--rk-radius-lg);
        background: var(--rk-bg-elevated);
        box-shadow: var(--rk-shadow-lg);
      }
      .panel__input { display: flex; align-items: center; gap: .7rem; padding: .85rem 1rem; border-bottom: 1px solid var(--rk-border); }
      .panel__icon { color: var(--rk-text-muted); font-size: 1.1rem; }
      .panel__input input { flex: 1; border: 0; background: none; font-size: 1rem; outline: none; }
      .panel__close {
        padding: .2rem .45rem;
        border: 1px solid var(--rk-border);
        border-radius: var(--rk-radius-sm);
        background: var(--rk-surface-secondary);
        color: var(--rk-text-muted);
        font-family: var(--rk-font-mono);
        font-size: .72rem;
      }
      .panel__body { overflow-y: auto; padding: .6rem; }
      .panel__state { margin: .5rem; color: var(--rk-text-secondary); font-size: .92rem; }
      .panel__count { margin: .35rem .55rem .55rem; color: var(--rk-text-muted); font-size: .78rem; text-transform: uppercase; letter-spacing: .08em; }
      .results { display: grid; gap: .2rem; margin: 0; padding: 0; list-style: none; }
      .result {
        display: grid;
        gap: .3rem;
        width: 100%;
        padding: .7rem .75rem;
        border-radius: var(--rk-radius);
        text-align: left;
      }
      .result.is-active { background: var(--rk-surface-secondary); }
      .result__head { display: flex; align-items: center; gap: .55rem; }
      .result__head strong { color: var(--rk-text); font-size: .96rem; }
      .result__snippet { color: var(--rk-text-secondary); font-size: .86rem; line-height: 1.5; }
      .result__meta { color: var(--rk-text-muted); font-size: .75rem; }
    `,
  ],
})
export class SearchOverlayComponent {
  readonly open = input<boolean>(false);
  readonly closed = output<void>();

  readonly i18n = inject(I18nService);
  private readonly api = inject(DocumentationApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly queries = new Subject<string>();

  readonly query = signal('');
  readonly results = signal<SearchResult[]>([]);
  readonly loading = signal(false);
  readonly active = signal(0);

  constructor() {
    this.queries
      .pipe(
        debounceTime(220),
        distinctUntilChanged(),
        switchMap(value => {
          if (value.trim().length < 2) {
            this.loading.set(false);
            return of<SearchResult[]>([]);
          }
          this.loading.set(true);
          return this.api
            .search(value, this.i18n.language(), 'latest')
            .pipe(catchError(() => of<SearchResult[]>([])));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(items => {
        this.loading.set(false);
        this.results.set(items);
        this.active.set(0);
      });

    effect(() => {
      if (this.open()) {
        this.query.set('');
        this.results.set([]);
        queueMicrotask(() => this.inputRef()?.nativeElement.focus());
      }
    });
  }

  onQuery(value: string): void {
    this.query.set(value);
    this.queries.next(value);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.active.update(index => Math.min(index + 1, this.results().length - 1));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.active.update(index => Math.max(index - 1, 0));
      return;
    }
    if (event.key === 'Enter') {
      const item = this.results()[this.active()];
      if (item) this.go(item);
    }
  }

  go(item: SearchResult): void {
    void this.router.navigate(['/docs', item.language, item.version, ...item.slug.split('/')]);
    this.close();
  }

  close(): void {
    this.closed.emit();
  }
}
