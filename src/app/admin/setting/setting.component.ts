import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../api.service';
import { ToastrService } from 'ngx-toastr';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { User } from '@core/models/user.model';
import { Observable } from 'rxjs';


interface RestResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
  };
}

@Component({
  selector: 'app-setting',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.css'
})
export class SettingComponent implements OnInit {
  userInfo: User | null = null;
  loading = false;
  error: string | null = null;
  currentUser$: Observable<User | null>;

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService
  ) {
    this.currentUser$ = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.fetchUserInfo();
  }

  private fetchUserInfo(): void {
    this.loading = true;
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    };

    this.apiService.get<RestResponse>('/users/self', { headers, observe: 'response' }).subscribe({
      next: (event) => {

        if (event.type === HttpEventType.Response) {
          // Cast the event to HttpResponse
          const response = event as HttpResponse<RestResponse>;

          if (response.body) {
            this.userInfo = response.body.data?.user;
          } else {
            this.error = 'No data received from server';
            this.toastr.error('No data received from server');
          }
        }
      },
      error: (error) => {
        console.error('Error:', error);
        this.error = error.message;
        this.loading = false;
        this.toastr.error('Failed to fetch user information');
      }
    });
  }

  handleLogout(): void {
    this.authService.logout();
    this.toastr.success('Logged out successfully');
    this.router.navigate(['login']);
  }
}
