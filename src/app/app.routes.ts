import { Routes } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingComponent } from './admin/setting/setting.component';
import { DashboardContentComponent } from './admin/dashboard-content/dashboard-content.component';

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
            }
        ]
    },
];
