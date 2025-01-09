import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { ApiService } from '../../../api.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddMovieDialogComponent } from '../add-movie-dialog/add-movie-dialog.component';
import { EditMovieDialogComponent } from '../edit-movie-dialog/edit-movie-dialog.component';
import Swal from 'sweetalert2';
import { environment } from 'app/environment';

interface Movies {
  id: number;
  movieName: string;
  genre: string;
  releaseDate: string;
  duration: string;
  description: string;
  image: string | null;
  theatre: {
    id: number;
    name: string;
  };
}

@Component({
  selector: 'app-view-movie',
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './view-movie.component.html',
  styleUrls: ['./view-movie.component.css']
})
export class ViewMovieComponent implements OnInit {
  movies: Movies[] = [];
  loading = false;
  error: string | null = null;
  searchTerm: string = '';

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchMovies();
  }

  private fetchMovies(): void {
    this.loading = true;
    this.error = null;
  
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    };
  
    this.apiService.get<Movies[]>('/movie', { headers, observe: 'response' }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          const response = event as HttpResponse<Movies[]>;
          if (response.body) {
            this.movies = response.body;
            console.log('Movies:', this.movies);
          }
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error:', error);
        this.error = error.message || 'Failed to fetch movie';
        this.loading = false;
        this.toastr.error('Failed to fetch movie details');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // Method to fetch movie image URL
  getMovieImageUrl(movie: { id: number, image: string | null }): string {
    if (movie && movie.image) {
      return `${environment.apiUrl}/files/movie-image/${movie.image}`;
    }
    return `${environment.apiUrl}/files/movie-image/default-image.jpg`;
  }

  // Filter movies by search term
  filterMovies(): Movies[] {
    if (!this.searchTerm) return this.movies;
    return this.movies.filter(movie =>
      movie.movieName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      movie.genre.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Open Add Movie Dialog
  openAddMovieDialog(): void {
    const dialogRef = this.dialog.open(AddMovieDialogComponent, {
      width: '500px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchMovies();
        this.toastr.success('Movie added successfully');
      }
    });
  }

  // Open Edit Movie Dialog
  openEditDialog(movie: Movies): void {
    const dialogRef = this.dialog.open(EditMovieDialogComponent, {
      width: '800px',
      data: movie
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchMovies();
      }
    });
  }

  // Delete Movie
  deleteMovie(movie: Movies): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `You want to delete ${movie.movieName}?`,
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
        this.apiService.delete(`/movie/${movie.id}`, { headers, responseType: 'text' }).subscribe({
          next: (response) => {
            Swal.fire({
              title: 'Deleted!',
              text: 'The movie has been deleted successfully.',
              icon: 'success',
              confirmButtonColor: '#1B355E'
            });
            this.fetchMovies();
          },
          error: (error) => {
            Swal.fire({
              title: 'Error!',
              text: error.error?.message || 'Failed to delete movie',
              icon: 'error',
              confirmButtonColor: '#1B355E'
            });
          }
        });
      }
    });
  }

  // Open Image Dialog to select a new image
  openImageDialog(movie: Movies): void {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.click();

    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadImage(movie, file);
      }
    };
  }

  // Upload selected image to the server
  uploadImage(movie: Movies, file: File): void {
    const formData = new FormData();
    formData.append('file', file, file.name);  // Ensure you're sending 'file' as the parameter name
  
    const headers = {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`  // Ensure the token is valid
    };
  
    // Check that the URL is correctly formatted
    const uploadUrl = `/files/movie/${movie.id}/image`;
  
    console.log('Uploading to:', uploadUrl);
    console.log('FormData:', formData);
  
    this.apiService.post(uploadUrl, formData, { headers }).subscribe({
      next: (response) => {
        console.log('Image uploaded successfully:', response);
        this.toastr.success('Image uploaded successfully');
        this.fetchMovies(); // Re-fetch movie data to show updated image
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        this.toastr.error('Failed to upload image');
      }
    });
  }
  
}
