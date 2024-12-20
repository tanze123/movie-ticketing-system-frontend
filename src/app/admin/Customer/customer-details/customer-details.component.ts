import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../api.service';
import { ToastrService } from 'ngx-toastr';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { User } from '../../../core/models/user.model';
import { EditCutomerDetailsComponent } from '../edit-cutomer-details/edit-cutomer-details.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

interface RestResponse {
  success: boolean;
  message?: string;
  data: {
    user: User[];
  };
}

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.css'
})
export class CustomerDetailsComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error: string | null = null;
  searchTerm: string = '';

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  private fetchUsers(): void {
    this.loading = true;
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    };

    this.apiService.get<RestResponse>('/users', { headers, observe: 'response' }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          const response = event as HttpResponse<RestResponse>;
          if (response.body && response.body.data && response.body.data.user) {
            this.users = response.body.data.user;
          }
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error:', error);
        this.error = error.message;
        this.loading = false;
        this.toastr.error('Failed to fetch customer details');
      }
    });
  }

   openEditDialog(profile: User): void {
      const dialogRef = this.dialog.open(EditCutomerDetailsComponent, {
        width: '800px',
        data: profile
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.fetchUsers(); // Refresh the theatre list
        }
      });
    }

    // Search functionality
  filterProfile(): User[] {
    if (!this.searchTerm) return this.users;
    
    return this.users.filter(user => 
      user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }


  refreshProfile(): void {
    this.fetchUsers();
  }

}
