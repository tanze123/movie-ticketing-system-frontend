import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../api.service';
import { HttpResponse } from '@angular/common/http';

interface MovieRequest {
  movieName: string;
  genre: string;
  releaseDate: string;
  duration: string;
  description: string;
  theatre: {
    id: number;
    name: string;
  };
}

interface Theatre {
  id: number;
  name: string;
  location: string;
  seatingCapacity: number;
  facilities: string;
  contactDetails: string;
}

@Component({
  selector: 'app-add-movie-dialog',
  imports: [ CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule],
  templateUrl: './add-movie-dialog.component.html',
  styleUrls: ['./add-movie-dialog.component.css'] // fixed styleUrls typo
})
export class AddMovieDialogComponent implements OnInit {
  movieForm: FormGroup;
  loading = false;
  theatres: any[] = []; // Ensure this is plural and clear

  constructor(
  private fb: FormBuilder,
  private dialogRef: MatDialogRef<AddMovieDialogComponent>,
  private apiService: ApiService,
  private toastr: ToastrService
){
  this.movieForm = this.fb.group({
    name: ['', [Validators.required]],
    genre: ['', [Validators.required]],
    duration: ['', [Validators.required]],
    description: [''],
    theatre: ['', [Validators.required]]
  });
}

  ngOnInit(): void {
    this.loadTheatres(); // Call to load theatres on initialization
  }

  loadTheatres(): void {
    this.loading = true;
    this.apiService.get('/theatres', { observe: 'response' }).subscribe({
      next: (response) => {
        if (response instanceof HttpResponse) {
          // Ensure the response body is an array of theatres
          this.theatres = response.body as Theatre[] || [];  // Safely assign the array
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

  onSubmit() {
    if (this.movieForm.valid) {
      this.loading = true;
      
      const formValue = this.movieForm.value;
  
      // Transform the data to match the expected format, excluding releaseDate
      const movieRequest = {
        movieName: formValue.name,
        genre: formValue.genre,
        duration: formValue.duration.toString(),
        description: formValue.description,
        theatre: {
          id: parseInt(formValue.theatre)
        }
      };
  
      console.log('Movie Request:', movieRequest); // For debugging
  
      this.apiService.post('/movie', movieRequest)
        .subscribe({
          next: (response) => {
            console.log('Response:', response); // For debugging
            this.loading = false;
            this.toastr.success('Movie added successfully');
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error details:', error); // For debugging
            this.loading = false;
            this.toastr.error(error.error?.message || 'Failed to add movie');
          }
        });
    } else {
      this.toastr.error('Please fill all required fields correctly');
    }
  }

  onCancel(): void {
    const dialogContainer = document.querySelector('.dialog-container');
    if (dialogContainer) {
      dialogContainer.classList.add('dialog-exit');
      setTimeout(() => {
        this.dialogRef.close();
      }, 200);
    } else {
      this.dialogRef.close();
    }
  }
  
}
