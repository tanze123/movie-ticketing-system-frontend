// src/app/admin/add-theatres/add-theatre-dialog/add-theatre-dialog.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../api.service';

@Component({
  selector: 'app-add-theatre-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './add-theatre-dialog.component.html',
  styleUrls: ['./add-theatre-dialog.component.css']
})
export class AddTheatreDialogComponent {
  theatreForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddTheatreDialogComponent>,
    private apiService: ApiService,
    private toastr: ToastrService
  ) {
    this.theatreForm = this.fb.group({
      name: ['', [Validators.required]],
      location: ['', [Validators.required]],
      seatingCapacity: ['', [Validators.required, Validators.min(1)]],
      facilities: ['', [Validators.required]],
      contactDetails: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.theatreForm.valid) {
      this.loading = true;
      
      const token = localStorage.getItem('accessToken');
  
      const headers = {
        'Authorization': `Bearer ${token}`
      };
  
      this.apiService.post('/theatres', this.theatreForm.value, { headers })
        .subscribe({
          next: () => {  // Removed unused 'response' parameter
            this.loading = false;
            this.toastr.success('Theatre added successfully');
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error:', error);
            this.loading = false;
            this.toastr.error(error.message || 'Failed to add theatre');
          }
        });
    } else {
      this.toastr.error('Please fill all required fields correctly');
    }
  }

  onCancel(): void {
    const dialogContainer = document.querySelector('.dialog-container');
    if (dialogContainer) {
      dialogContainer.classList.add('dialog-exit');
      setTimeout(() => {
        this.dialogRef.close();
      }, 200);
    } else {
      this.dialogRef.close();
    }
  }
}
