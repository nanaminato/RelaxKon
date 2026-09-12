import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '../config/api-base-url.token';
import { DocumentContent, NavigationNode, SearchResult } from '../models/content.models';

@Injectable({ providedIn: 'root' })
export class DocumentationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  getLanguages() { return this.http.get<{ code: string; name: string }[]>(`${this.baseUrl}/docs/languages`); }
  getVersions(language?: string) { return this.http.get<string[]>(`${this.baseUrl}/docs/versions`, { params: language ? { language } : {} }); }
  getNavigation(language: string, version: string) { return this.http.get<NavigationNode[]>(`${this.baseUrl}/docs/${encodeURIComponent(language)}/${encodeURIComponent(version)}/navigation`); }
  getDocument(language: string, version: string, slug: string) { return this.http.get<DocumentContent>(`${this.baseUrl}/docs/${encodeURIComponent(language)}/${encodeURIComponent(version)}/${slug}`); }
  search(query: string, language: string, version: string) { return this.http.get<SearchResult[]>(`${this.baseUrl}/docs/search`, { params: new HttpParams().set('q', query).set('language', language).set('version', version) }); }
}
