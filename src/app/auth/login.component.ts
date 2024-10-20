import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <h2>Login</h2>
      <div *ngIf="!confirmationResult">
        <input [(ngModel)]="phoneNumber" placeholder="Phone Number" />
        <button id="sign-in-button" (click)="signIn()">Sign In</button>
      </div>
      <div *ngIf="confirmationResult">
        <input [(ngModel)]="verificationCode" placeholder="Verification Code" />
        <button (click)="verifyCode()">Verify</button>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 300px;
      margin: 0 auto;
      padding: 20px;
      text-align: center;
    }
    input, button {
      width: 100%;
      margin-bottom: 10px;
      padding: 10px;
    }
  `]
})
export class LoginComponent {
  phoneNumber: string = '';
  verificationCode: string = '';
  confirmationResult: any;

  constructor(private authService: AuthService) {}

  async signIn() {
    try {
      const recaptchaVerifier = this.authService.initRecaptcha('sign-in-button');
      this.confirmationResult = await this.authService.signInWithPhoneNumber(this.phoneNumber, recaptchaVerifier);
    } catch (error) {
      console.error('Error during sign in', error);
    }
  }

  async verifyCode() {
    try {
      await this.authService.verifyCode(this.confirmationResult, this.verificationCode);
    } catch (error) {
      console.error('Error during code verification', error);
    }
  }
}