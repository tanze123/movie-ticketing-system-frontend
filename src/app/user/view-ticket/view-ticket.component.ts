import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'app/api.service';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-view-ticket',
  imports: [CommonModule],
  templateUrl: './view-ticket.component.html',
  styleUrls: ['./view-ticket.component.css']
})
export class ViewTicketComponent implements OnInit {
  ticketId!: number;
  ticket: any = null;
  error: string = '';
  selectedSeats: Set<string> = new Set();  // Track selected seats
  seats: any[] = [];  // Example seats data

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.ticketId = +params['id'];  // Get ticket ID from the route parameter
      this.fetchTicketDetails();
    });
  }

  fetchTicketDetails(): void {
    this.apiService.getTicketDetails(this.ticketId).subscribe({
      next: (data) => {
        this.ticket = data;  // Store the fetched ticket data
        this.seats = data.seats || [];  // Assuming `seats` are included in ticket data
      },
      error: (err) => {
        this.error = 'Error fetching ticket details';  // Handle errors
        console.error(err);
      }
    });
  }

  // Select or deselect seat
  selectSeat(seatNumber: string): void {
    if (this.selectedSeats.has(seatNumber)) {
      this.selectedSeats.delete(seatNumber);  // Deselect
    } else {
      this.selectedSeats.add(seatNumber);  // Select
    }
  }

  // Get selected seats as a comma-separated string
  getSelectedSeats(): string {
    return Array.from(this.selectedSeats).join(', ');
  }

  // Generate PDF for ticket details
  generatePDF(): void {
    const doc = new jsPDF();
  
    // Add header (Movie Name)
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text('B-Movies Ticket', 14, 20);
  
    // Add Movie Name
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text(`Movie: ${this.ticket.movie.movieName}`, 14, 40);
  
    // Add Showtimes
    doc.text(`Showtime: ${new Date(this.ticket.movie.releaseDate).toLocaleString()}`, 14, 50);
  
    // Add Theatre Info
    doc.text(`Theatre: ${this.ticket.movie.theatre.name}`, 14, 60);
    doc.text(`Location: ${this.ticket.movie.theatre.location}`, 14, 70);
  
    // Add Seat Number
    doc.text(`Seat Number: ${this.ticket.seatNumber}`, 14, 80);
  
    // Add Ticket Holder Info
    doc.text(`Ticket Holder: ${this.ticket.user.name}`, 14, 90);
    doc.text(`Ticket Number: ${this.ticket.ticketNumber}`, 14, 100);
  
    // Save the generated PDF
    doc.save('ticket.pdf');
  }
  
  bookTickets(): void {
    // Implement the ticket booking logic
    alert('Tickets booked for: ' + this.getSelectedSeats());
  }
}
