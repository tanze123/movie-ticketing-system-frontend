import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../core/models/user.model';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isSidebarCollapsed = false;
  isMobile = false;
  isProfileMenuOpen = false;
  currentUser$: Observable<User | null>;
  loading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.currentUser$ = this.authService.getCurrentUser();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.isProfileMenuOpen = false;
    }
  }

  ngOnInit() {
    this.checkScreenSize();
    if(this.authService.getRoles()!="ADMIN"){
      this.router.navigate(['Userdashboard']);
    }
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.isSidebarCollapsed = true;
    }
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
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
        this.loading = true;
        await this.authService.logout();
        Swal.fire('Logged out!', 'You have been logged out successfully.', 'success');
        this.router.navigate(['/login']);
      } else {
        Swal.fire('Cancelled', 'You are still logged in.', 'info');
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to logout. Please try again.', 'error');
    } finally {
      this.loading = false;
    }
  }
  

  // Method to handle keydown events for accessibility
  @HostListener('keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.isProfileMenuOpen && event.key === 'Escape') {
      this.isProfileMenuOpen = false;
    }
  }
}
