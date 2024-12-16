import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../api.service';

interface Theatre {
  id: number;
  name: string;
  location: string;
  seatingCapacity: number;
  facilities: string;
  contactDetails: string;
}

@Component({
  selector: 'app-edit-theatre-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatDialogModule],
  templateUrl: './edit-theatre-dialog.component.html',
  styleUrls: ['./edit-theatre-dialog.component.css']
})
export class EditTheatreDialogComponent implements OnInit {
  theatreForm: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<EditTheatreDialogComponent>,
    private apiService: ApiService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: Theatre
  ) {
    this.theatreForm = this.formBuilder.group({
      name: ['', Validators.required],
      location: ['', Validators.required],
      seatingCapacity: ['', [Validators.required, Validators.min(50)]],
      contactDetails: ['', [Validators.required]],
      facilities: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.data) {
      this.theatreForm.patchValue({
        name: this.data.name,
        location: this.data.location,
        seatingCapacity: this.data.seatingCapacity,
        contactDetails: this.data.contactDetails,
        facilities: this.data.facilities
      });
    }
  }

  get f() {
    return this.theatreForm.controls;
  }

  onPhoneNumberInput(event: any) {
    let value = event.target.value;
    if (!value.startsWith('+975')) {
      value = '+975' + value.replace(/\D/g, '').slice(0, 8);
    } else {
      value = value.replace(/[^\d+]/g, '').slice(0, 12);
    }
    this.theatreForm.get('contactDetails')?.setValue(value);
  }

  onSubmit() {
    this.submitted = true;

    if (this.theatreForm.invalid) {
      return;
    }

    const theatreData = {
      ...this.theatreForm.value,
      id: this.data.id
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    };

    this.apiService.put(`/theatres/${this.data.id}`, theatreData, { headers }).subscribe({
      next: () => {
        this.toastr.success('Theatre updated successfully');
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Failed to update theatre');
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}