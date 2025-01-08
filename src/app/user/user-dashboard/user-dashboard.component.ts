import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { User } from '@core/models/user.model';
import { AuthService } from '@core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
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

  ngOnInit() {
    if (!this.authService.getRoles() || this.authService.getRoles() === "ADMIN") {
      this.router.navigate(['/login']);
    }
  }
}
