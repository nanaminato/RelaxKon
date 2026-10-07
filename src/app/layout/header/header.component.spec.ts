import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { I18nService, SiteLanguage } from '../../core/i18n/i18n.service';
import { ThemeService } from '../../core/theme/theme.service';
import { HeaderComponent } from './header.component';

@Component({ template: '' })
class EmptyPage {}

describe('Shared documentation language selection', () => {
  it('switches the current document while retaining its version, slug, fragment and query', async () => {
    const language = signal<SiteLanguage>('zh-CN');
    const setLanguage = vi.fn(async (value: SiteLanguage) => { language.set(value); });
    TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([{ path: '**', component: EmptyPage }]),
        { provide: I18nService, useValue: { language, setLanguage } },
        { provide: ThemeService, useValue: {} },
      ],
    }).overrideComponent(HeaderComponent, { set: { template: '', imports: [] } });
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/docs/zh-CN/latest/apps/terminal?from=downloads#session');
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentInstance.setLanguage('ja-JP');
    await fixture.whenStable();
    expect(router.url).toBe('/docs/ja-JP/latest/apps/terminal?from=downloads#session');
    expect(language()).toBe('ja-JP');
    expect(setLanguage).toHaveBeenCalledWith('ja-JP');
  });
});
