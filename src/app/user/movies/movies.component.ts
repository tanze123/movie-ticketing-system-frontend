import { CommonModule } from '@angular/common';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ViewMovieComponent } from 'app/admin/movie/view-movie/view-movie.component';
import { ApiService } from 'app/api.service';
import { ToastrService } from 'ngx-toastr';
import { ViewMovieDetailsComponent } from '../view-movie-details/view-movie-details.component';

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
    location: string;
    seatingCapacity: number;
    facilities: string;
    contactDetails: string;
    // Add other fields from the Theatre entity as needed
  };
}

@Component({
  selector: 'app-movies',
  imports: [CommonModule, FormsModule],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.css'
})
export class MoviesComponent {
  movies: Movies[] = [];
  loading = false;
  error: string | null = null;
  searchTerm: string = '';

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private dialog: MatDialog
    
  ) {}

  openMovieDetails(movie: any): void {
    this.dialog.open(ViewMovieDetailsComponent, {
      width: '70%',
      maxWidth: '1500px',
      data: movie,
      panelClass: 'custom-dialog-container'
    });
  }

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
}
