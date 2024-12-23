import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../api.service';


interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: number;
  
}

@Component({
  selector: 'app-edit-cutomer-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatDialogModule],
  templateUrl: './edit-cutomer-details.component.html',
  styleUrls: ['./edit-cutomer-details.component.css']
})
export class EditCutomerDetailsComponent implements OnInit {
  usersForm: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<EditCutomerDetailsComponent>,
    private apiService: ApiService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {
    this.usersForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.min(50)]],
    });
  }

  ngOnInit() {
    if (this.data) {
      this.usersForm.patchValue({
        name: this.data.name,
        email: this.data.email,
        phoneNumber: this.data.phoneNumber,
      });
    }
  }

  get f() {
    return this.usersForm.controls;
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
    this.usersForm.get('phoneNumber')?.setValue(value, { emitEvent: false });
  }

  onSubmit() {
    this.submitted = true;

    if (this.usersForm.invalid) {
      return;
    }

    const usersData = {
      ...this.usersForm.value,
      id: this.data.id
    };
    console.log('Payload to API:', usersData); 

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    };

    this.apiService.patch(`/users/${this.data.id}`, usersData, { headers }).subscribe({
      next: () => {
        this.toastr.success('customer updated successfully');
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