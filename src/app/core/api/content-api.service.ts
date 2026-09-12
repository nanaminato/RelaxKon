import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api-base-url.token';
import { DownloadInfo, FaqItem, ReleaseDetails, ReleaseSummary } from '../models/content.models';

/** Typed client for downloads, releases and FAQ content. */
@Injectable({ providedIn: 'root' })
export class ContentApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  downloads(): Observable<DownloadInfo[]> {
    return this.http.get<DownloadInfo[]>(`${this.baseUrl}/downloads`);
  }

  releases(): Observable<ReleaseSummary[]> {
    return this.http.get<ReleaseSummary[]>(`${this.baseUrl}/releases`);
  }

  release(version: string): Observable<ReleaseDetails> {
    return this.http.get<ReleaseDetails>(`${this.baseUrl}/releases/${encodeURIComponent(version)}`);
  }

  faq(language: string): Observable<FaqItem[]> {
    return this.http.get<FaqItem[]>(`${this.baseUrl}/faq`, {
      params: new HttpParams().set('language', language),
    });
  }
}
