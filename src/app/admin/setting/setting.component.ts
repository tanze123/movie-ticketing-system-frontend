import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../api.service';
import { ToastrService } from 'ngx-toastr';
import { HttpEventType, HttpResponse } from '@angular/common/http';

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
}

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

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService
  ) {}

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
            this.toastr.success('User information loaded successfully');
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
}
