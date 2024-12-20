import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { EditTheatreDialogComponent } from '../../theatre/edit-theatre-dialog/edit-theatre-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'app/api.service';

interface Profile {
  id: number;
  name: string;
  phoneNumber: string;
  email: number;
}
@Component({
  selector: 'app-edit-profile',
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatDialogModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})

export class EditProfileComponent implements OnInit {
profileForm: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<EditTheatreDialogComponent>,
    private apiService: ApiService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: Profile
  ) {
    this.profileForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+975\d{8}$/)]]
    });
  }

  ngOnInit() {
    if (this.data) {
      this.profileForm.patchValue({
        name: this.data.name,
        phoneNumber: this.data.phoneNumber,
        email: this.data.email,
      });
    }
  }

  get f() {
    return this.profileForm.controls;
  }

  onPhoneNumberInput(event: any) {
    let value = event.target.value;
    
    // Remove all non-digit characters except '+'
    value = value.replace(/[^\d+]/g, '');
    
    // Ensure the value starts with +975
    if (!value.startsWith('+975')) {
      if (value.startsWith('+')) {
        value = '+975' + value.substring(1);
      } else if (value.startsWith('975')) {
        value = '+' + value;
      } else {
        value = '+975' + value;
      }
    }
    
    // Limit to maximum length of 12 (+975 + 8 digits)
    if (value.length > 12) {
      value = value.slice(0, 12);
    }
  
    // Update the form control value
    this.profileForm.get('phoneNumber')?.setValue(value, { emitEvent: false });
  }

  onSubmit() {
    this.submitted = true;

    if (this.profileForm.invalid) {
      return;
    }

    const profileData = {
      ...this.profileForm.value,
      id: this.data.id
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    };

    this.apiService.patch(`/users/${this.data.id}`, profileData, { headers }).subscribe({
      next: () => {
        this.toastr.success('Profile updated successfully');
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
