import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { SharedModule } from '../_shared-components/shared.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SharedModule],
  declarations: [LoginComponent],
})
export class LoginModule { }
