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

interface Movies {
  id: number;
  movieName: string;
  genre: string;
  releaseDate: string;
  duration: string;
  description: string;
  theatre: {
    id: number;
    name: string;
    // Add other fields from the Theatre entity as needed
  };
}

@Component({
  selector: 'app-view-movie',
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './view-movie.component.html',
  styleUrl: './view-movie.component.css'
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
  

  // Search functionality
  filterMovies(): Movies[] {
    if (!this.searchTerm) return this.movies;

    return this.movies.filter(movie =>
      movie.movieName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      movie.genre.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Refresh movie list
  refreshMovies(): void {
    this.fetchMovies();
  }

  openAddMovieDialog(): void {
    const dialogRef = this.dialog.open(AddMovieDialogComponent, {
      width: '500px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh the movie list after adding
        this.fetchMovies();
        this.toastr.success('Movie added successfully');
      }
    });
  }

   openEditDialog(movie: Movies): void {
      const dialogRef = this.dialog.open(EditMovieDialogComponent, {
        width: '800px',
        data: movie
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.fetchMovies(); // Refresh the theatre list
        }
      });
    }

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
      
            // Specify responseType as text
            this.apiService.delete(`/movie/${movie.id}`, { 
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
                this.fetchMovies(); // Refresh the list
              },
              error: (error) => {
                // Check if it's actually a successful response
                if (error.status === 200) {
                  Swal.fire({
                    title: 'Deleted!',
                    text: 'Movie has been deleted successfully.',
                    icon: 'success',
                    confirmButtonColor: '#1B355E'
                  });
                  this.fetchMovies(); // Refresh the list
                } else {
                  Swal.fire({
                    title: 'Error!',
                    text: error.error?.message || 'Failed to delete movie',
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
