import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile/profile.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { ToastrModule } from "ngx-toastr";

@NgModule({
  declarations: [ProfileComponent, SignInComponent, SignUpComponent],
  imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      //ToastrModule
    ],
    exports: [ProfileComponent, SignInComponent, SignUpComponent]
})
export class UserModule { }
