import { CommonModule } from '@angular/common';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'app/api.service'; // Import ApiService for API calls
import { environment } from 'app/environment';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService for toast notifications
import { forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

interface Seat {
  seatNumber: number;
  status: 'booked' | 'available'; // Seat status: booked or available
}

interface Movies {
  id: number; // Assuming each movie has an id
  movieName: string;
  genre: string;
  releaseDate: string;
  description: string;
}

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
  selector: 'app-seat-selection',
  templateUrl: './seat-selection.component.html',
  imports: [CommonModule],
  styleUrls: ['./seat-selection.component.css']
})
export class SeatSelectionComponent implements OnInit {
  movieId!: number; // To store the movie ID from the route
  theatreId!: number; // To store the theatre ID from the route
  seats: Seat[] = []; // Array to hold the status of the seats
  selectedSeats: Set<number> = new Set(); // To store selected seats by their ID
  movies: Movies[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private toastr: ToastrService // Inject ToastrService
  ) { }

  ngOnInit(): void {
    // Fetch movieId and theatreId from the route parameters
    this.movieId = +this.route.snapshot.paramMap.get('movieId')!;
    this.theatreId = +this.route.snapshot.paramMap.get('theatreId')!;
    this.fetchSeats();
    this.fetchMovies();
  }

  // Fetch seats from the backend using the API service
  private fetchSeats(): void {
    this.apiService.getSeatStatus(this.movieId, this.theatreId).subscribe({
      next: (response) => {
        // Assuming the response is an array of seat status
        this.seats = response.map((seat: any) => ({
          seatNumber: seat.seatNumber,
          status: seat.booked ? 'booked' : 'available' // Adjust as per the response structure
        }));
      },
      error: (error) => {
        console.error('Error fetching seats:', error);
      },
    });
  }

  // Method to toggle seat selection
  selectSeat(seatNumber: number): void {
    if (this.selectedSeats.has(seatNumber)) {
      this.selectedSeats.delete(seatNumber); // Deselect if already selected
    } else {
      this.selectedSeats.add(seatNumber); // Select if not selected
    }
  }

  // Method to get selected seats as an array
  getSelectedSeats(): string {
    return Array.from(this.selectedSeats).join(', ');
  }

  // Method to book selected seats
  bookTickets(): void {
    // Prepare the payload for the booking API
    const selectedSeatNumbers = Array.from(this.selectedSeats);

    // Collect seat numbers that were successfully booked
    const bookedSeats: number[] = [];

    // Make the API calls for all selected seats
    const bookingRequests = selectedSeatNumbers.map(seatNumber => {
      const payload = {
        movie: {
          id: this.movieId
        },
        seatNumber: seatNumber
      };

      return this.apiService.bookTicket(payload).pipe(
        // For each successful booking, update UI and track the booked seat
        tap(response => {
          bookedSeats.push(seatNumber);

          // Update the seat status immediately in the UI
          this.seats = this.seats.map(seat =>
            seat.seatNumber === seatNumber ? { ...seat, status: 'booked' } : seat
          );

          // Optionally remove the seat from the selected seats set
          this.selectedSeats.delete(seatNumber);
        }),
        // Handle errors for individual requests
        catchError(error => {
          console.error('Error booking ticket:', error);
          this.toastr.error('Failed to book some tickets. Please try again.', 'Booking Failed');
          return of(null); // Return an empty observable to continue processing other bookings
        })
      );
    });

    // Wait for all booking requests to complete
    forkJoin(bookingRequests).subscribe(() => {
      // Show a single success toast message for all booked seats
      if (bookedSeats.length > 0) {
        this.toastr.success(`Seats ${bookedSeats.join(', ')} booked successfully!`, 'Booking Successful');
      }
    });
  }

  // Fetch movie data
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
            // Filter the movies to only include the one with the matching movieId
            this.movies = response.body.filter(movie => movie.id === this.movieId);
            console.log('Filtered Movies:', this.movies);
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

  getMovieImageUrl(movie: { id: number, image: string | null }): string {
    // Check if movie exists and has an image name
    if (movie && movie.image) {
      return `${environment.apiUrl}/files/movie-image/${movie.image}`;
    }

    // Return a fallback URL or an empty string if no image is available
    return `${environment.apiUrl}/files/movie-image/default-image.jpg`;
  }
  
}
