
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardContentComponent } from './admin/dashboard-content/dashboard-content.component';
import { CustomerDetailsComponent } from './admin/customer-details/customer-details.component';
import { Routes } from '@angular/router';
import { ViewTheatreComponent } from './admin/theatre/view-theatre/view-theatre.component';
import { AddTheatreDialogComponent } from './admin/theatre/add-theatre-dialog/add-theatre-dialog.component';
import { EditProfileComponent } from './admin/settings/edit-profile/edit-profile.component';
import { SettingComponent } from './admin/settings/view-setting/setting.component';

export const routes: Routes = [
    {path:'', component: LoginComponent},
    {path:'login', component: LoginComponent},
    {path:'signup', component: SignupComponent},
    {
        path:'dashboard', 
        component: DashboardComponent, 
        children: [
            {
                path: '',
                component: DashboardContentComponent
            }, 
            {
                path: 'setting',
                component: SettingComponent
            },
            {
                path: 'dashboard-content',
                component: DashboardContentComponent
            },
            {
                path: 'customer-details',
                component: CustomerDetailsComponent
            },
            {
                path: 'view-theatres',
                component: ViewTheatreComponent
            },
            {
                path: 'add-theatres',
                component: AddTheatreDialogComponent
            }, 
            {
                path: 'edit-theatres',
                component: AddTheatreDialogComponent
            },
            {
                path: 'editProfile',
                component: EditProfileComponent
            }
        ]
    },
];
