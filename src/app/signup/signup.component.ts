import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SignupModel } from '../models/signup.model';
import { SignupService } from '../services/signup.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrModule, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [
    RouterLink, 
    RouterModule, 
    ReactiveFormsModule, 
    CommonModule,
    ToastrModule
  ]
})
export class SignupComponent {
  signupForm: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private signupService: SignupService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.signupForm = this.formBuilder.group({
      name: ['', [
        Validators.required, 
      ]],
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern(/^\+975\d{8}$/) // Validates the phone number format
      ]],
      
      email: ['', [
        Validators.required, 
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
      ]],
      confirmPassword: ['', Validators.required]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  onPhoneNumberInput(event: any) {
    let value = event.target.value;
  
    // Ensure the value starts with +975 and is a valid length
    if (value.startsWith('+975') && value.length <= 12) {
      this.signupForm.get('phoneNumber')?.setValue(value);
    } else {
      // Otherwise, allow only digits after +975
      this.signupForm.get('phoneNumber')?.setValue('+975' + value.replace(/[^0-9]/g, '').slice(0, 8));
    }
  }
  

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    return password && confirmPassword && password.value === confirmPassword.value 
      ? null 
      : { passwordMismatch: true };
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.signupForm.invalid) {
      return;
    }

    const signupData: SignupModel = {
      email: this.signupForm.value.email,
      password: this.signupForm.value.password,
      name: this.signupForm.value.name,
      phoneNumber: this.signupForm.value.phoneNumber
    };

    this.signupService.signup(signupData).subscribe({
      next: (data) => {
        this.toastr.success('Signup successful', 'Success');
        this.router.navigate(['login']);
      },
      error: (data) => {
        this.toastr.error(data.error?.message || 'Signup failed', 'Error');
      }
    });
  }

  // Getter for easy access to form fields
  get f() { return this.signupForm.controls; }
}