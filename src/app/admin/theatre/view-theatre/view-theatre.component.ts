import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { ApiService } from '../../../api.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddTheatreDialogComponent } from '../add-theatre-dialog/add-theatre-dialog.component';
import { EditTheatreDialogComponent } from '../edit-theatre-dialog/edit-theatre-dialog.component';
import Swal from 'sweetalert2';

interface Theatres {
  id: number;
  name: string;
  location: string;
  seatingCapacity: number;
  facilities: string;
  contactDetails: string;
}

@Component({
  selector: 'app-view-theatre',
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './view-theatre.component.html',
  styleUrl: './view-theatre.component.css'
})
export class ViewTheatreComponent implements OnInit{
  theatres: Theatres[] = [];
  loading = false;
  error: string | null = null;
  searchTerm: string = '';

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchTheatres();
  }

  private fetchTheatres(): void {
    this.loading = true;
    this.error = null;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    };

    this.apiService.get<Theatres[]>('/theatres', { headers, observe: 'response' }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          const response = event as HttpResponse<Theatres[]>;
          if (response.body) {
            this.theatres = response.body;
          }
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error:', error);
        this.error = error.message || 'Failed to fetch theatres';
        this.loading = false;
        this.toastr.error('Failed to fetch theatres details');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // Search functionality
  filterTheatres(): Theatres[] {
    if (!this.searchTerm) return this.theatres;
    
    return this.theatres.filter(theatre => 
      theatre.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      theatre.location.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Refresh theatres list
  refreshTheatres(): void {
    this.fetchTheatres();
  }

  openAddTheatreDialog(): void {
    const dialogRef = this.dialog.open(AddTheatreDialogComponent, {
      width: '500px',
      disableClose: true
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh the theatres list after adding
        this.fetchTheatres();
        this.toastr.success('Theatre added successfully');
      }
    });
  }

  openEditDialog(theatre: Theatres): void {
    const dialogRef = this.dialog.open(EditTheatreDialogComponent, {
      width: '800px',
      data: theatre
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchTheatres(); // Refresh the theatre list
      }
    });
  }

  deleteTheatre(theatre: Theatres): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete ${theatre.name}?`,
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
        this.apiService.delete(`/theatres/${theatre.id}`, { 
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
            this.fetchTheatres(); // Refresh the list
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
              this.fetchTheatres(); // Refresh the list
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
