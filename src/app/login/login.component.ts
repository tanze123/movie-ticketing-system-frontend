import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginModel } from '../core/models/login.model';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { RouterLink, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [RouterLink, RouterModule, ReactiveFormsModule, CommonModule, ToastrModule],
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit(): void {
    if (this.authService.getToken() && this.authService.getRoles()) {
      this.redirectByRole(this.authService.getRoles());
    }
  }
  

  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    const loginData: LoginModel = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.authService.setToken(response.accessToken);
        if (response.refreshToken) {
          this.authService.setRefreshToken(response.refreshToken);
        }
        
        if(this.authService.getRoles()==null || this.authService.getRoles()==undefined){
          this.authService.getCurrentUser().subscribe(user => {
            this.authService.setRoles(user?.roles);
            this.redirectByRole(this.authService.getRoles());
          });
        }else{
          this.redirectByRole(this.authService.getRoles());
        }
        // Fetch user details and redirect based on role
        
      },
      error: (data) => {
        this.toastr.error(data.error?.message || 'Login failed', 'Error');
      },
    });
    
  }

 redirectByRole(roles: string | null): void {
    if (roles == 'ADMIN') {
      this.router.navigate(['/dashboard']);
    } else if (roles == 'USER') {
      this.router.navigate(['/user/dashboard']);
    } 
    this.toastr.success('Login successful', 'Success');
  }
  

  // Getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }
}
