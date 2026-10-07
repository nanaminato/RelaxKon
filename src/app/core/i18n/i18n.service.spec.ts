import { TestBed } from '@angular/core/testing';
import { I18nService } from './i18n.service';

describe('One website language', () => {
  const originalUrl = window.location.href;
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    history.replaceState(null, '', originalUrl);
  });

  it('opens a documentation deep link in the same language as its article, overriding an older saved choice', async () => {
    localStorage.setItem('rk-language', 'zh-CN');
    history.replaceState(null, '', '/docs/ja-JP/latest/apps/terminal');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ nav: { documentation: 'ドキュメント' } }) } as Response);
    const i18n = TestBed.inject(I18nService);
    await i18n.initialize();
    TestBed.tick();
    expect(i18n.language()).toBe('ja-JP');
    expect(document.documentElement.lang).toBe('ja-JP');
    expect(i18n.t('nav.documentation')).toBe('ドキュメント');
  });

  it('discards a late dictionary response after a newer language selection', async () => {
    let resolveChinese!: (value: unknown) => void;
    const chinese = new Promise(resolve => { resolveChinese = resolve; });
    vi.spyOn(globalThis, 'fetch').mockImplementation(async url => ({ ok: true, json: () => String(url).includes('zh-CN') ? chinese : Promise.resolve({ label: '日本語' }) }) as Response);
    const i18n = TestBed.inject(I18nService);
    const first = i18n.setLanguage('zh-CN');
    await i18n.setLanguage('ja-JP');
    resolveChinese({ label: '中文' });
    await first;
    expect(i18n.language()).toBe('ja-JP');
    expect(i18n.t('label')).toBe('日本語');
    expect(localStorage.getItem('rk-language')).toBe('ja-JP');
  });

  it('allows a session language change even if browser storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: async () => ({ label: '中文' }) } as Response);
    const i18n = TestBed.inject(I18nService);
    await i18n.setLanguage('zh-CN');
    expect(i18n.language()).toBe('zh-CN');
    expect(i18n.t('label')).toBe('中文');
  });
});
