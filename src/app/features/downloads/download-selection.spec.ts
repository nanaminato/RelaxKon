import { DownloadInfo } from '../../core/models/content.models';
import { compareVersions, detectDevice, latestDownloads } from './download-selection';

const artifact = (overrides: Partial<DownloadInfo> = {}): DownloadInfo => ({
  platform: 'windows', architecture: 'x64', version: '0.1.2', url: '/client.zip',
  size: '1 MB', checksum: 'abc', releaseDate: '2026-09-16', isAvailable: true,
  fileName: 'client.zip', packageKind: 'client', ...overrides,
});

describe('Download target detection', () => {
  it('identifies Windows without treating a reduced Win64 UA as proof of an x64 CPU', () => {
    expect(detectDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toEqual({ platform: 'windows', architecture: null });
  });
  it('does not recommend an Intel Mac download to Apple silicon users', () => {
    expect(detectDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')).toEqual({ platform: 'macos', architecture: null });
  });
  it('distinguishes Android and ARM Linux from desktop Linux', () => {
    expect(detectDevice('Linux; Android 14')).toEqual({ platform: 'android', architecture: null });
    expect(detectDevice('Linux aarch64')).toEqual({ platform: 'linux', architecture: 'arm64' });
  });
  it('does not offer a macOS client on iOS or iPadOS desktop user agents', () => {
    expect(detectDevice('iPhone; CPU iPhone OS 18_0 like Mac OS X').platform).toBeNull();
    expect(detectDevice('Macintosh; Intel Mac OS X', 'MacIntel', 5).platform).toBeNull();
  });
  it('leaves unknown systems for manual selection', () => {
    expect(detectDevice('Unknown')).toEqual({ platform: null, architecture: null });
  });
});

describe('Latest published stable downloads', () => {
  it('compares numerical versions rather than lexical strings or feed order', () => {
    expect(compareVersions('0.10.0', '0.9.9')).toBeGreaterThan(0);
    const items = latestDownloads([artifact({ version: '0.9.9' }), artifact({ version: '0.10.0' }), artifact({ version: '0.2.0' })]);
    expect(items.map(item => item.version)).toEqual(['0.10.0']);
  });
  it('never replaces a downloadable stable client with an unavailable or prerelease build', () => {
    const items = latestDownloads([artifact(), artifact({ version: '9.0.0', isAvailable: false }), artifact({ version: '10.0.0-beta.1' }), artifact({ version: '11.0.0', url: '' })]);
    expect(items.map(item => item.version)).toEqual(['0.1.2']);
  });
  it('keeps separate targets for each architecture and package type and normalizes platform names', () => {
    const items = latestDownloads([artifact({ platform: 'Windows' }), artifact({ architecture: 'arm64' }), artifact({ packageKind: 'server' }), artifact({ platform: 'linux', packageKind: 'user-server' })]);
    expect(items).toHaveLength(4);
    expect(items[0].platform).toBe('windows');
  });
  it('offers only installable APKs on Android, never store publishing AAB files', () => {
    const items = latestDownloads([artifact({ platform: 'android', fileName: 'mobile.apk' }), artifact({ platform: 'android', version: '1.0.0', fileName: 'mobile.aab' })]);
    expect(items.map(item => item.fileName)).toEqual(['mobile.apk']);
  });
});
