import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api-base-url.token';
import {
  DocumentContent,
  LanguageInfo,
  NavigationNode,
  SearchResult,
} from '../models/content.models';

/**
 * Typed client for the documentation API.
 *
 * Components never build an absolute host: the base URL comes from the
 * `API_BASE_URL` injection token, which reads the environment configuration.
 */
@Injectable({ providedIn: 'root' })
export class DocumentationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getLanguages(): Observable<LanguageInfo[]> {
    return this.http.get<LanguageInfo[]>(`${this.baseUrl}/docs/languages`);
  }

  getVersions(language?: string): Observable<string[]> {
    const params = language ? new HttpParams().set('language', language) : undefined;
    return this.http.get<string[]>(`${this.baseUrl}/docs/versions`, { params });
  }

  getNavigation(language: string, version: string): Observable<NavigationNode[]> {
    return this.http.get<NavigationNode[]>(
      `${this.baseUrl}/docs/${encodeURIComponent(language)}/${encodeURIComponent(version)}/navigation`,
    );
  }

  getDocument(language: string, version: string, slug: string): Observable<DocumentContent> {
    return this.http.get<DocumentContent>(
      `${this.baseUrl}/docs/${encodeURIComponent(language)}/${encodeURIComponent(version)}/${encodeSlug(slug)}`,
    );
  }

  search(query: string, language: string, version: string): Observable<SearchResult[]> {
    const params = new HttpParams().set('q', query).set('language', language).set('version', version);
    return this.http.get<SearchResult[]>(`${this.baseUrl}/docs/search`, { params });
  }
}

/** Encodes each slug segment while keeping the `/` separators intact. */
function encodeSlug(slug: string): string {
  return slug
    .split('/')
    .filter(Boolean)
    .map(segment => encodeURIComponent(segment))
    .join('/');
}
