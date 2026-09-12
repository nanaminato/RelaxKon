export interface NavigationNode { title: string; slug: string | null; children: NavigationNode[]; }
export interface DocumentLink { slug: string; title: string; }
export interface DocumentContent { id: string; slug: string; title: string; description: string; category: string; order: number; content: string; language: string; version: string; lastUpdated: string; previous: DocumentLink | null; next: DocumentLink | null; }
export interface SearchResult { slug: string; title: string; description: string; category: string; language: string; version: string; snippet: string; }
export interface DownloadInfo { platform: string; architecture: string; version: string; url: string; size: string; checksum: string; releaseDate: string; isAvailable: boolean; }
export interface ReleaseSummary { version: string; title: string; summary: string; releaseDate: string; }
export interface ReleaseDetails extends ReleaseSummary { content: string; }
export interface FaqItem { question: string; answer: string; order: number; }
