import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../config/api-base-url.token';
import { DownloadInfo, FaqItem, ReleaseDetails, ReleaseSummary } from '../models/content.models';

@Injectable({ providedIn: 'root' })
export class ContentApiService {
  private readonly http = inject(HttpClient); private readonly baseUrl = inject(API_BASE_URL);
  downloads() { return this.http.get<DownloadInfo[]>(`${this.baseUrl}/downloads`); }
  releases() { return this.http.get<ReleaseSummary[]>(`${this.baseUrl}/releases`); }
  release(version: string) { return this.http.get<ReleaseDetails>(`${this.baseUrl}/releases/${encodeURIComponent(version)}`); }
  faq() { return this.http.get<FaqItem[]>(`${this.baseUrl}/faq`); }
}
