import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'app/api.service';
import { ToastrService } from 'ngx-toastr';
import { HttpResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from 'app/environment';

interface Ticket {
  ticketId: number;
  ticketNumber: number;
  seatNumber: number;
  movieName: string;
  theatreName: string;
  movie: Movies;
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
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  imports: [CommonModule],
  styleUrls: ['./bookings.component.css']
})
export class BookingsComponent {
  movie: Movies | null = null;
  tickets: Ticket[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private apiService: ApiService, 
    private toastr: ToastrService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchUserTickets();
  }

  fetchUserTickets(): void {
    this.loading = true;
    const headers = {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    };
  
    this.apiService.get<any[]>('/tickets/user/tickets', { headers, observe: 'response' }).subscribe({
      next: (event) => {
        if (event instanceof HttpResponse) {
          // Map the API response to the Ticket interface
          this.tickets = (event.body || []).map(ticket => ({
            ticketId: ticket.id,
            ticketNumber: ticket.ticketNumber,
            seatNumber: ticket.seatNumber,
            movieName: ticket.movie.movieName,
            theatreName: ticket.movie.theatre.name,
            movie: ticket.movie  // Store the full movie object
          }));
          
          this.loading = false;
        }
      
      },
      error: (error) => {
        console.error('Error fetching tickets:', error);
        this.error = error.message || 'Failed to fetch tickets';
        this.loading = false;
        this.toastr.error('Failed to fetch tickets');
      },
    });
  }

  // Redirect to view more details on click
  goToTicketDetails(ticketId: number): void {
    this.router.navigate(['/Userdashboard/ticket', ticketId]);
  }

  getMovieImageUrl(movie: Movies): string {
    if (movie && movie.image) {
      return `${environment.apiUrl}/files/movie-image/${movie.image}`;
    }
     return `${environment.apiUrl}/files/movie-image/default-image.jpg`;
  }
    
}
