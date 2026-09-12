import { Component, DestroyRef, ElementRef, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { I18nService, SITE_LANGUAGES, SiteLanguage } from '../../core/i18n/i18n.service';
import { ThemePreference, ThemeService } from '../../core/theme/theme.service';
import { SearchOverlayComponent } from '../search/search-overlay.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, FormsModule, SearchOverlayComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  readonly i18n = inject(I18nService);
  readonly theme = inject(ThemeService);
  readonly languages = SITE_LANGUAGES;
  readonly themeOptions: { value: ThemePreference; glyph: string; label: string }[] = [
    { value: 'system', glyph: '◐', label: 'theme.system' },
    { value: 'light', glyph: '☀', label: 'theme.light' },
    { value: 'dark', glyph: '☾', label: 'theme.dark' },
  ];

  readonly productsOpen = signal(false);
  readonly mobileOpen = signal(false);
  readonly searchOpen = signal(false);
  readonly scrolled = signal(false);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.productsOpen()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) this.productsOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAll();
  }

  @HostListener('document:keydown', ['$event'])
  onShortcut(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
    if (event.key === '/' && !typing && !this.searchOpen()) {
      event.preventDefault();
      this.searchOpen.set(true);
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  toggleProducts(event: MouseEvent): void {
    event.stopPropagation();
    this.productsOpen.update(value => !value);
  }

  toggleMobile(): void {
    this.mobileOpen.update(value => !value);
  }

  openSearch(): void {
    this.searchOpen.set(true);
    this.closeAll();
  }

  closeAll(): void {
    this.productsOpen.set(false);
    this.mobileOpen.set(false);
  }

  setTheme(value: ThemePreference): void {
    this.theme.set(value);
  }

  setLanguage(value: string): void {
    void this.i18n.setLanguage(value as SiteLanguage);
  }
}
