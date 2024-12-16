import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { ApiService } from '../../../api.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddTheatreDialogComponent } from '../add-theatre-dialog/add-theatre-dialog.component';

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
}
