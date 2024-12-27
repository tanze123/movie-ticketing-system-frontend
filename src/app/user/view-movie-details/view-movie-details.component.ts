import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ViewMovieComponent } from 'app/admin/movie/view-movie/view-movie.component';

@Component({
  selector: 'app-view-movie-details',
  imports: [],
  templateUrl: './view-movie-details.component.html',
  styleUrl: './view-movie-details.component.css'
})
export class ViewMovieDetailsComponent {
  constructor(
    public dialogRef: MatDialogRef<ViewMovieComponent>,
    @Inject(MAT_DIALOG_DATA) public movie: any
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
