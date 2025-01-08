import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'app/api.service'; // Import ApiService for API calls
import { ToastrService } from 'ngx-toastr'; // Import ToastrService for toast notifications
import { forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

interface Seat {
  seatNumber: number;
  status: 'booked' | 'available'; // Seat status: booked or available
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

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private toastr: ToastrService // Inject ToastrService
  ) {}

  ngOnInit(): void {
    // Fetch movieId and theatreId from the route parameters
    this.movieId = +this.route.snapshot.paramMap.get('movieId')!;
    this.theatreId = +this.route.snapshot.paramMap.get('theatreId')!;
    this.fetchSeats();
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
}