import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GraphData } from '../models/graph-data.model';

interface SaveResponse {
  success: boolean;
  message: string;
  filename?: string;
  error?: string;
}

interface LoadResponse {
  success: boolean;
  data?: GraphData;
  loadedFrom?: 'source' | 'saved';
  filename?: string;
  message?: string;
  error?: string;
}

interface DiagramListResponse {
  success: boolean;
  files: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DiagramPersistenceService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  /**
   * Load diagram data from file
   * Loads from saved directory if exists, otherwise from source directory
   */
  loadDiagram(filename: string): Observable<LoadResponse> {
    return this.http.get<LoadResponse>(`${this.apiUrl}/load-diagram/${filename}`);
  }

  /**
   * Save diagram data to file
   */
  saveDiagram(filename: string, data: GraphData): Observable<SaveResponse> {
    return this.http.post<SaveResponse>(`${this.apiUrl}/save-diagram`, {
      filename,
      data
    });
  }

  /**
   * Get list of available diagrams
   */
  listDiagrams(): Observable<DiagramListResponse> {
    return this.http.get<DiagramListResponse>(`${this.apiUrl}/diagrams`);
  }

  /**
   * Check if API server is available
   */
  checkHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
}
