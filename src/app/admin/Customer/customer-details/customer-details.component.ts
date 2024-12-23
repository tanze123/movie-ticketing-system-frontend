import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../api.service';
import { ToastrService } from 'ngx-toastr';
import { HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { User } from '../../../core/models/user.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { EditCutomerDetailsComponent } from '../edit-cutomer-details/edit-cutomer-details.component';

interface RestResponse {
  success: boolean;
  message?: string;
  data: {
    enabledUsers: User[];
    disabledUsers: User[];
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
  filteredUsers: User[] = [];
  searchTermSubject: Subject<string> = new Subject<string>();

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.searchTermSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe((searchTerm) => {
      this.onSearchChange(searchTerm);
    });
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
          if (response.body && response.body.data) {
            this.users = [
              ...(response.body.data.enabledUsers || []),
              ...(response.body.data.disabledUsers || [])
            ];
            this.filteredUsers = this.users;
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
        this.fetchUsers(); // Refresh the list
      }
    });
  }

  onSearchChange(searchTerm: string): void {
    this.filteredUsers = this.users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  toggleUserStatus(event: Event, user: User): void {
    event.preventDefault();
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    });
    
    const endpoint = `/users/${user.id}/${user.enabled ? 'disable' : 'enable'}`;
    const originalState = user.enabled;

    user.enabled = !user.enabled;
    this.apiService.put<any>(endpoint, {}, { headers }).subscribe({
      next: (response) => {
        this.toastr.success(`User ${user.enabled ? 'activated' : 'deactivated'} successfully`);
      },
      error: (error) => {
        console.error('Error response:', error);
        user.enabled = originalState;
        this.toastr.error('Failed to update user status');
      }
    });
  }
}
