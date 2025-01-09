import { CommonModule } from '@angular/common';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';  // Import Router for navigation
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'app/api.service';
import { ToastrService } from 'ngx-toastr';
import { ViewMovieDetailsComponent } from '../view-movie-details/view-movie-details.component';
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
  styleUrls: ['./movies.component.css']
})
export class MoviesComponent {
  movies: Movies[] = [];
  loading = false;
  error: string | null = null;
  searchTerm: string = '';

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private router: Router  // Inject Router for navigation
  ) { }

  // Method to navigate to seat selection with movie and theatre information
  bookNow(movie: Movies): void {
    // Navigate to seat selection component, passing the movie ID and theatre ID as parameters
    this.router.navigate(['/Userdashboard/seat-selection', movie.id, movie.theatre.id]);
  }

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

  getMovieImageUrl(movie: { id: number, image: string | null }): string {
    // Check if movie exists and has an image name
    if (movie && movie.image) {
      return `${environment.apiUrl}/files/movie-image/${movie.image}`;
    }

    // Return a fallback URL or an empty string if no image is available
    return `${environment.apiUrl}/files/movie-image/default-image.jpg`;
  }

}
