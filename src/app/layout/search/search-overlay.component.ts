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
  templateUrl: './search-overlay.component.html',
  styleUrl: './search-overlay.component.scss',
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
