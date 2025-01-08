import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardContentComponent } from './admin/dashboard-content/dashboard-content.component';
import { CustomerDetailsComponent } from './admin/Customer/customer-details/customer-details.component';
import { Routes } from '@angular/router';
import { ViewTheatreComponent } from './admin/theatre/view-theatre/view-theatre.component';
import { AddTheatreDialogComponent } from './admin/theatre/add-theatre-dialog/add-theatre-dialog.component';
import { EditProfileComponent } from './admin/settings/edit-profile/edit-profile.component';
import { SettingComponent } from './admin/settings/view-setting/setting.component';
import { EditCutomerDetailsComponent } from './admin/Customer/edit-cutomer-details/edit-cutomer-details.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ViewMovieComponent } from './admin/movie/view-movie/view-movie.component';
import { AddMovieDialogComponent } from './admin/movie/add-movie-dialog/add-movie-dialog.component';
import { UserDashboardComponent } from './user/user-dashboard/user-dashboard.component';
import { ContentsComponent } from './user/contents/contents.component';
import { MoviesComponent } from './user/movies/movies.component';
import { ViewMovieDetailsComponent } from './user/view-movie-details/view-movie-details.component';
import { ViewProfileComponent } from './user/profile/view-profile/view-profile.component';
import { SeatSelectionComponent } from './user/seat-selection/seat-selection.component';
import { TicketComponent } from './admin/ticket/ticket.component';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },

    {
        path: 'Userdashboard',
        component: UserDashboardComponent,
        children: [
            {
                path: '',
                component: ContentsComponent
            },
            {
                path: 'userContent',
                component: ContentsComponent
            },
            {
                path: 'movies',
                 component: MoviesComponent  
             },
             { path: 'moviesDetails/:id',
             component: ViewMovieDetailsComponent 
            },
            {
                path: 'view-profile',
                component: ViewProfileComponent
            },
            {
                path: 'seat-selection/:movieId/:theatreId',
                component: SeatSelectionComponent
            }
        ]
    },
    
      {
        path: 'dashboard',
        component: DashboardComponent,
        children: [
            {
                path: '',
                component: DashboardContentComponent
            },
            {
                path: 'ticket',
                component: TicketComponent
            },
            {
                path: 'setting',
                component: SettingComponent
            },
            {
                path: 'content',
                component: DashboardContentComponent
            },
            {
                path: 'theatres',
                component: ViewTheatreComponent,
                children: [
                    {
                        path: 'add',
                        component: AddTheatreDialogComponent
                    },
                    {
                        path: 'edit',
                        component: AddTheatreDialogComponent
                    }
                ]
            },

            {
                path: 'customer',
                component: CustomerDetailsComponent,
                children: [
                    {
                        path: 'edit',
                        component: EditCutomerDetailsComponent
                    }
                ]
            },
     
            {
                path: 'editProfile',
                component: EditProfileComponent
            },
            {
                path: 'editCustomer',
                component: EditCutomerDetailsComponent
            },
            {
                path: 'viewMovie',
                component: ViewMovieComponent
            },
            {
                path: 'addMovie',
                component: AddMovieDialogComponent
            },
            {
                path: 'edit/movie',
                component: EditCutomerDetailsComponent
            }

        ]
    },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password/:token', component: ResetPasswordComponent }
];
