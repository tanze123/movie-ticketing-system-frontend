import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { User } from '@core/models/user.model';
import { AuthService } from '@core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

    @ViewChild('profileDropdown') profileDropdown!: ElementRef;
    
    currentUser$: Observable<User | null>;
    isDropdownOpen = false;
  
    constructor(
      private router: Router,
      private authService: AuthService,
      private toastr: ToastrService
    ) {
      this.currentUser$ = this.authService.getCurrentUser();
    }

    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen;
    }
  
    // Close dropdown when clicking outside
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
      if (this.profileDropdown && !this.profileDropdown.nativeElement.contains(event.target)) {
        this.isDropdownOpen = false;
      }
    }
    
  async logout() {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You will be logged out of your account.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, logout',
        cancelButtonText: 'Cancel',
      });
  
      if (result.isConfirmed) {
        await this.authService.logout();
        Swal.fire('Logged out!', 'You have been logged out successfully.', 'success');
        this.router.navigate(['/login']);
      } else {
        Swal.fire('Cancelled', 'You are still logged in.', 'info');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to logout. Please try again.', 'error');
    } finally {
    }
  }
}
