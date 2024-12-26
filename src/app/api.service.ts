import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from './environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, options?: any): Observable<HttpEvent<T>> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, options);
  }

  post<T>(endpoint: string, body: any, options?: any): Observable<HttpEvent<T>> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, options);
  }

  put<T>(endpoint: string, body: any, options: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, {
      headers: options.headers
    })
  };

  delete<T>(endpoint: string, options?: any): Observable<HttpEvent<T>> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, options);
  }

  patch<T>(endpoint: string, body: any, options?: any): Observable<HttpEvent<T>> {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body, options);
  }


  getTheatres(): Observable<any[]> {  // Ensure the return type is an array of theatres
    return this.http.get<any[]>('http://localhost:8080/api/v1/theatres');
  }

}
