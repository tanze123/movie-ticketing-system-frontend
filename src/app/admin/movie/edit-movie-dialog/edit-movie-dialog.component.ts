import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'app/api.service';
import { ToastrService } from 'ngx-toastr';
import { HttpResponse } from '@angular/common/http';

interface Theatre {
  id: number;
  name: string;
  location: string;
  seatingCapacity: number;
  facilities: string;
  contactDetails: string;
}

interface Movie {
  id: number;
  movieName?: string;
  genre: string;
  releaseDate: string;
  duration: string;
  description: string;
  theatre: {
    id: number;
    name: string;
  };
}

@Component({
  selector: 'app-edit-movie-dialog',
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatDialogModule],
  templateUrl: './edit-movie-dialog.component.html',
  styleUrls: ['./edit-movie-dialog.component.css']
})
export class EditMovieDialogComponent implements OnInit {
  movieForm: FormGroup;
  loading = false;
  submitted = false;
  theatres: Theatre[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditMovieDialogComponent>,
    private apiService: ApiService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: Movie
  ) {
    this.movieForm = this.fb.group({
      movieName: ['', [Validators.required]],
      genre: ['', [Validators.required]],
      duration: ['', [Validators.required]],
      description: [''],
      theatre: ['', [Validators.required]] // Changed to string type for ID
    });
  }

  ngOnInit() {
    if (this.data) {
      this.movieForm.patchValue({
        movieName: this.data.movieName,
        genre: this.data.genre,
        duration: this.data.duration,
        description: this.data.description,
        theatre: this.data.theatre.id.toString() // Convert ID to string
      });
    }
    this.loadTheatres();
  }

  loadTheatres(): void {
    this.loading = true;
    this.apiService.get('/theatres', { observe: 'response' }).subscribe({
      next: (response) => {
        if (response instanceof HttpResponse) {
          this.theatres = response.body as Theatre[] || [];
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error fetching theatres:', err);
        this.loading = false;
        this.toastr.error('Failed to load theatres');
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.movieForm.invalid) {
      return;
    }

    const formValues = this.movieForm.value;
    const movieData = {
      movieName: formValues.movieName,
      genre: formValues.genre,
      duration: formValues.duration,
      description: formValues.description,
      theatre: {
        id: parseInt(formValues.theatre) // Convert string back to number
      }
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    };

    this.apiService.put(`/movie/${this.data.id}`, movieData, { headers }).subscribe({
      next: () => {
        this.toastr.success('Movie updated successfully');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Update error:', error); // Add error logging
        this.toastr.error(error.error?.message || 'Failed to update Movie');
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);  // Close the dialog without any changes
  }
  
}
