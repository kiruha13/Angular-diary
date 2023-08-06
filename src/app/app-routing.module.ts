import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./component/login/login.component";
import {RegisterComponent} from "./component/register/register.component";
import {DashboardComponent} from "./component/dashboard/dashboard.component";
import {VerifyEmailComponent} from "./component/verify-email/verify-email.component";
import {ForgotPasswordComponent} from "./component/forgot-password/forgot-password.component";
import {AddPostComponent} from "./component/add-post/add-post.component";
import {EditPostComponent} from "./component/edit-post/edit-post.component";
import {AuthGuard} from "./shared/auth.guard";

const routes: Routes = [
  {path:'',redirectTo:'login',pathMatch:'full'},
  {path:'login',component:LoginComponent},
  {path:'dashboard',component:DashboardComponent, canActivate:[AuthGuard]},
  {path:'register',component:RegisterComponent},
  {path:'verify-email',component:VerifyEmailComponent},
  {path:'forgot-password',component:ForgotPasswordComponent},
  {path:'add-post',component:AddPostComponent,canActivate:[AuthGuard]},
  { path: 'edit-post/:id', component: EditPostComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
