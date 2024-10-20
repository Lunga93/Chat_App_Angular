import { Injectable } from '@angular/core';
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier, UserCredential, User } from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = getAuth();
  private userSubject = new BehaviorSubject<User | null>(null);

  constructor() {
    this.auth.onAuthStateChanged((user) => {
      this.userSubject.next(user);
    });
  }

  initRecaptcha(buttonId: string) {
    const recaptchaVerifier = new RecaptchaVerifier(this.auth, buttonId, {
      'size' : 'invisible',
    });    
    return recaptchaVerifier;
  }

  async signInWithPhoneNumber(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) {
    try {
      const confirmationResult = await signInWithPhoneNumber(this.auth, phoneNumber, recaptchaVerifier);
      return confirmationResult;
    } catch (error) {
      console.error('Error during signInWithPhoneNumber', error);
      throw error;
    }
  }

  async verifyCode(confirmationResult: any, code: string) {
    try {
      const result = await confirmationResult.confirm(code);
      this.userSubject.next(result.user);
      return result;
    } catch (error) {
      console.error('Error during code verification', error);
      throw error;
    }
  }

  get currentUser() {
    return this.userSubject.asObservable();
  }

  signOut() {
    return this.auth.signOut();
  }
}