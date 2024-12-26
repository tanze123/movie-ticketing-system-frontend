import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LoginModel, LoginResponseModel } from '../models/login.model';
import { ApiService } from '../../api.service';
import { User } from '../models/user.model';
import { UserService } from './user.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
 
  private TOKEN_KEY = 'access_token';
  private REFRESH_TOKEN_KEY = 'refresh_token';
  private ROLE = 'role';

  constructor(
    private apiService: ApiService,
    private userService: UserService,
    private router: Router
  ) {}

  // Store tokens
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  // Get tokens
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setRoles(role: string):void{
    localStorage.setItem(this.ROLE,role);
  }

  getRoles():string|null{
    return localStorage.getItem(this.ROLE);
  }

  removeRoles():void{
    localStorage.removeItem(this.ROLE);
  }

  // Remove tokens
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  removeRefreshToken(): void {
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
  

  // Validate token by calling a protected endpoint
  validateToken(): Observable<boolean> {
    return this.apiService.get('/users/self').pipe(
      map(() => true),
      catchError(() => of(false)) // Ensure it returns false on error
    );
  }
  
    // Login method
    login(loginData: LoginModel): Observable<LoginResponseModel> {
      return this.apiService.post<LoginResponseModel>('/auth/login', loginData).pipe(
        map((response: any) => {
          // Assuming the backend returns an object with access_token and refresh_token
          this.setToken(response.data.access_token);
          this.setRefreshToken(response.data.refresh_token);
          return response.data;
        })
      );
    }

    getCurrentUser(): Observable<User> {
      return this.apiService.get<{ status: boolean, data: { user: User } }>('/users/self').pipe(
        map((response: any) => {        
          const user: User = {
            id: response?.data?.user?.id,
            email: response?.data?.user?.email,
            roles: response?.data?.user?.roles, // Ensure this matches the backend
            name: response?.data?.user?.name,
          };
        
          this.userService.setCurrentUser(user);
          return user;
        }),
        catchError((error) => {
          if (error.status === 403) {
            this.router.navigate(['/login']);
          }
          return throwError(() => error);
        })
      );
    }
    
  refreshToken(): Observable<LoginResponseModel> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
  
    return this.apiService.post<LoginResponseModel>('/auth/refresh-token', null, {
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    }).pipe(
      map((response: any) => {
        if (!response?.data?.accessToken || !response?.data?.refreshToken) {
          throw new Error('Invalid token response');
        }
        
        // Store new tokens
        this.setToken(response.data.accessToken);
        this.setRefreshToken(response.data.refreshToken);
        return response.data;
      }),
      catchError((error) => {
        // Clear tokens on refresh failure
        this.logout();
        return throwError(() => error);
      })
    );
  }
  
  // Update logout method to be more thorough
  logout(): void {
    this.removeToken();
    this.removeRefreshToken();
    this.removeRoles();
    // Clear any other auth-related data from localStorage
    localStorage.clear();
  }

  forgotPassword(email: string): Observable<any> {
    return this.apiService.post('/auth/forgot-password', { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.apiService.post('/auth/reset-password', { token, password });
  }
  
}
