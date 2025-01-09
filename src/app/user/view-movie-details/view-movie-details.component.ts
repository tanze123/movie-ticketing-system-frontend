import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ViewMovieComponent } from 'app/admin/movie/view-movie/view-movie.component';
import { environment } from 'app/environment';

@Component({
  selector: 'app-view-movie-details',
  imports: [CommonModule],
  templateUrl: './view-movie-details.component.html',
  styleUrl: './view-movie-details.component.css'
})
export class ViewMovieDetailsComponent {
  constructor(
    public dialogRef: MatDialogRef<ViewMovieComponent>,
    @Inject(MAT_DIALOG_DATA) public movie: any
  ) { }

  close(): void {
    this.dialogRef.close();
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
