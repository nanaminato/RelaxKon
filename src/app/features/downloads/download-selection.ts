import { DownloadInfo } from '../../core/models/content.models';

export const DOWNLOAD_PLATFORMS = ['windows', 'macos', 'linux', 'android'] as const;
export type DownloadPlatform = (typeof DOWNLOAD_PLATFORMS)[number];
export interface DeviceTarget { platform: DownloadPlatform | null; architecture: string | null; }

/** User agents reliably identify an OS, but desktop CPU hints are often withheld. */
export function detectDevice(userAgent: string, platformHint = '', touchPoints = 0): DeviceTarget {
  const value = `${platformHint} ${userAgent}`.toLowerCase();
  if (/iphone|ipad|ipod/.test(value) || (/macintosh|macintel/.test(value) && touchPoints > 1)) return { platform: null, architecture: null };
  const platform = /android/.test(value) ? 'android'
    : /windows|win32|win64/.test(value) ? 'windows'
    : /macintosh|macintel|macos|mac os x/.test(value) ? 'macos'
    : /linux/.test(value) ? 'linux' : null;
  // macOS UAs commonly say Intel even on Apple silicon. Do not infer the CPU from that.
  const architecture = /aarch64|arm64/.test(value) ? 'arm64'
    : platform === 'linux' && /x86_64|amd64/.test(value) ? 'x64' : null;
  return { platform, architecture };
}

function versionParts(version: string): number[] {
  return version.replace(/^v/i, '').split('+')[0].split('.').map(part => Number(part) || 0);
}

export function compareVersions(a: string, b: string): number {
  const left = versionParts(a), right = versionParts(b);
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const difference = (left[i] ?? 0) - (right[i] ?? 0);
    if (difference) return difference;
  }
  return 0;
}

/** One latest downloadable stable artifact per OS, CPU and package type. */
export function latestDownloads(items: DownloadInfo[]): DownloadInfo[] {
  const targets = new Map<string, DownloadInfo>();
  for (const source of items) {
    if (!source.isAvailable || !source.url || !/^v?\d+(?:\.\d+)*(?:\+[^\s]+)?$/i.test(source.version)) continue;
    const item = { ...source, platform: source.platform.toLowerCase(), architecture: source.architecture.toLowerCase() };
    // App bundles are store publishing artifacts, not user-installable Android packages.
    if (item.platform === 'android' && !item.fileName?.toLowerCase().endsWith('.apk')) continue;
    const key = `${item.platform}/${item.architecture}/${item.packageKind}`;
    const previous = targets.get(key);
    if (!previous || compareVersions(item.version, previous.version) > 0) targets.set(key, item);
  }
  return [...targets.values()];
}
