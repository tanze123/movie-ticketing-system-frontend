import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { ApiService } from '../../../api.service';
import Swal from 'sweetalert2';
import { EditProfileComponent } from '../edit-profile/edit-profile.component';
import { MatDialog } from '@angular/material/dialog';

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
    private toastr: ToastrService,
    private dialog: MatDialog
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

  openEditDialog(profile: User): void {
    const dialogRef = this.dialog.open(EditProfileComponent, {
      width: '800px',
      data: profile
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchUserInfo(); // Refresh the theatre list
      }
    });
  }

  deleteProfile(profile: User): void {
      Swal.fire({
        title: 'Are you sure?',
        text: `You want to delete ${profile.name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1B355E',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          };
    
          // Specify responseType as text
          this.apiService.delete(`/users/${profile.id}`, { 
            headers, 
            responseType: 'text' 
          }).subscribe({
            next: (response) => {
              Swal.fire({
                title: 'Deleted!',
                text: 'Theatre has been deleted successfully.',
                icon: 'success',
                confirmButtonColor: '#1B355E'
              });
              this.fetchUserInfo(); // Refresh the list
            },
            error: (error) => {
              // Check if it's actually a successful response
              if (error.status === 200) {
                Swal.fire({
                  title: 'Deleted!',
                  text: 'Theatre has been deleted successfully.',
                  icon: 'success',
                  confirmButtonColor: '#1B355E'
                });
                this.fetchUserInfo(); // Refresh the list
              } else {
                Swal.fire({
                  title: 'Error!',
                  text: error.error?.message || 'Failed to delete theatre',
                  icon: 'error',
                  confirmButtonColor: '#1B355E'
                });
              }
            }
          });
        }
      });
    }

}
