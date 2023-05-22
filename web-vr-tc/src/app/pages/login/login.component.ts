import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { FuncService } from 'src/app/services/func.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  titleText: string = 'Sign In';
  usernameText: string = 'Username';
  errorText: string = '';
  infoText: string = '';
  isAuth: boolean = false;
  isInit: boolean = false;
  requestingUser: string = '';
  userCode: string = '';

  constructor(
    private api: ApiService,
    private func: FuncService,
    private router: Router
  ) {}

  // Initialize authorization on page load
  ngOnInit(): void {
    this.func.disableAllButtons();
    this.checkAuth();
  }

  // Prevent form from auto submitting when using submit buttons
  onSubmit(event: Event): void {
    const submitEvent = event as unknown as SubmitEvent;
    submitEvent.preventDefault();
  }

  // Handle sign up button click
  signup(): void {
    // Check if form is valid
    const shouldLogin =
      this.validateForm() &&
      this.validateUsernameReqs() &&
      this.validatePasswordReqs() &&
      this.validatePhoneReqs();

    // If given parameters are not valid, return
    if (!shouldLogin) {
      return;
    }

    // Get form values
    const username = this.getFirstFormValue();
    const password = this.getSecondFormValue();
    const phone = this.getThirdFormValue();

    // Disable all buttons for api call
    this.func.disableAllButtons();

    // Call api to register user
    this.api.register(username, password, phone).subscribe({
      next: () => {
        this.routeToDashboard();
      },
      error: (err) => {
        this.handleError(err.error.error);
      },
    });
  }

  // Handle login button click
  login(): void {
    // Check if form is valid
    const shouldLogin = this.validateForm({ phoneRequired: false });

    // If given parameters are not valid, return
    if (!shouldLogin) {
      return;
    }

    // Get form values
    const username = this.getFirstFormValue();
    const password = this.getSecondFormValue();

    // Disable all buttons for api call
    this.func.disableAllButtons();

    // Call api to login user
    this.api.login(username, password).subscribe({
      next: () => {
        this.routeToDashboard();
      },
      error: (err) => {
        this.handleError(err.error.error);
      },
    });
  }

  // Handle forgot password button click
  recoverPassword(): void {
    // Check if form is valid
    const shouldSend = this.validateForm({
      passwordRequired: false,
      phoneRequired: false,
    });

    // If given parameters are not valid, return
    if (!shouldSend) {
      return;
    }

    // Get form values
    const username = this.getFirstFormValue();

    // Reset error and disable all buttons for api call
    this.errorText = '';
    this.func.disableAllButtons();

    // Call api to send password recovery code
    this.api.recoverPassword(username).subscribe({
      next: () => {
        this.requestingUser = username;
        this.resetForm();
        this.usernameText = 'Verification Code';
        this.infoText =
          `We have sent a verification code to the phone number` +
          ` linked with ${this.requestingUser}'s account.`;
        document.querySelector('#info-message')?.classList.remove('hidden');
        document.querySelector('#password-recover')?.classList.add('hidden');
        document.querySelector('#verify-code')?.classList.remove('hidden');
        this.func.enableAllButtons();
      },
      error: (err) => {
        this.handleError(err.error.error);
      },
    });
  }

  // Handle code verification button click
  verifyCode(): void {
    // Get form values
    const code = this.getFirstFormValue();

    // Reset error and disable all buttons for api call
    this.errorText = '';
    this.func.disableAllButtons();

    // Call api to verify code
    this.api.verifyCode(this.requestingUser, code).subscribe({
      next: () => {
        this.userCode = code;
        this.resetForm();
        this.usernameText = 'New Password';
        this.infoText = '';
        document.querySelector('#info-message')?.classList.add('hidden');
        document.querySelector('#verify-code')?.classList.add('hidden');
        document.querySelector('#new-password')?.classList.remove('hidden');
        this.func.enableAllButtons();
      },
      error: (err) => {
        this.handleError(err.error.error);
      },
    });
  }

  // Handle new password button click
  newPassword(): void {
    // Get form values
    const password = this.getFirstFormValue();

    // Reset error and disable all buttons for api call
    this.errorText = '';
    this.func.disableAllButtons();

    // Call api to reset password
    this.api
      .resetPassword(this.requestingUser, password, this.userCode)
      .subscribe({
        next: () => {
          this.forgotToLogin();
        },
        error: (err) => {
          this.handleError(err.error.error);
        },
      });
  }

  // Handle button to navigate to create account page from login page
  createAccount(): void {
    this.titleText = 'Create Account';
    this.alternateSignupLogin();
    this.usernameText = 'Username';
  }

  // Handle button to navigate to login page from create account page
  createToLogin(): void {
    this.titleText = 'Sign In';
    this.alternateSignupLogin();
    this.usernameText = 'Username';
  }

  // Handle button to navigate to forgot password page from login page
  forgotPassword(): void {
    this.titleText = 'Forgot Password';
    this.alternateForgotPasswordLogin();
  }

  // Handle button to navigate to login page from any forgot password page
  forgotToLogin(): void {
    this.resetForm();
    this.titleText = 'Sign In';
    this.usernameText = 'Username';
    this.infoText = '';
    this.errorText = '';
    document.querySelector('#info-message')?.classList.add('hidden');
    document.querySelector('#password-recover')?.classList.add('hidden');
    document.querySelector('#verify-code')?.classList.add('hidden');
    document.querySelector('#signin')?.classList.remove('hidden');
    document.querySelector('#password-section')?.classList.remove('hidden');
    document.querySelector('#create-account')?.classList.remove('hidden');
    document.querySelector('#forgot-login-account')?.classList.add('hidden');
    document.querySelector('#new-password')?.classList.add('hidden');
    this.func.enableAllButtons();
  }

  // Function to validate the username requirements before sending to backend
  // (to prevent wasting time on backend checks if we can catch early)
  validateUsernameReqs(): boolean {
    // Get first form value
    const usernameValue = this.getFirstFormValue();
    const usernameLength = usernameValue.length;

    // Check if username is at least 3 characters
    if (usernameLength < 3) {
      this.handleError('Username must be at least 3 characters');
      return false;
    }
    return true;
  }

  // Function to validate the password requirements before sending to backend
  // (to prevent wasting time on backend checks if we can catch early)
  validatePasswordReqs(): boolean {
    // Get second form value
    const passwordValue = this.getSecondFormValue();

    // Check if password is at least 8 characters
    const passwordLength = passwordValue.length;

    // Check if password contains a special character, a number,
    // an uppercase letter and lowercase letter
    const hasNumber = /\d/.test(passwordValue);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      passwordValue
    );
    const hasUpperCase = /[A-Z]/.test(passwordValue);
    const hasLowerCase = /[a-z]/.test(passwordValue);

    // Check if password has all requirements
    const hasAllReqs =
      hasNumber &&
      hasSpecialChar &&
      hasUpperCase &&
      hasLowerCase &&
      passwordLength >= 8;

    // If password does not meet requirements, display error message
    if (!hasAllReqs) {
      this.handleError(
        'Password must be at least 8 characters and contain each of the ' +
          'following: 1 uppercase letter, 1 lowercase letter, 1 number, and ' +
          '1 special character.'
      );
      return false;
    }
    return true;
  }

  // Function to validate the phone number requirements before sending to backend
  // (to prevent wasting time on backend checks if we can catch early)
  validatePhoneReqs(): boolean {
    // Get third form value
    const phoneValue = this.getThirdFormValue()
      .replace('-', '')
      .replace('(', '')
      .replace(')', '')
      .replace(' ', '');
    const phoneLength = phoneValue.length;

    // Check if phone number is 10 digits
    if (phoneLength !== 10) {
      this.handleError('Phone number must be 10 digits');
      return false;
    }
    return true;
  }

  // Function to validate the form is not missing any required fields
  validateForm({
    usernameRequired = true,
    passwordRequired = true,
    phoneRequired = true,
  }: {
    usernameRequired?: boolean;
    passwordRequired?: boolean;
    phoneRequired?: boolean;
  } = {}): boolean {
    // Reset error message
    this.errorText = '';

    // Check if username is required and if it is empty
    if (usernameRequired) {
      const username = this.getFirstFormValue();
      if (username === '') {
        this.handleError(`${this.usernameText} is required`);
        return false;
      }
    }
    // Check if password is required and if it is empty
    if (passwordRequired) {
      const password = this.getSecondFormValue();
      if (password === '') {
        this.handleError('Password is required');
        return false;
      }
    }
    // Check if phone is required and if it is empty
    if (phoneRequired) {
      const phone = this.getThirdFormValue();
      if (phone === '') {
        this.handleError('Phone number is required');
        return false;
      }
    }
    return true;
  }

  // Reset form values
  resetForm(): void {
    (<HTMLFormElement>(<unknown>document.querySelector('#user-form')))?.reset();
  }

  // Route to dashboard page
  routeToDashboard(): void {
    this.resetForm();
    this.router.navigate(['/dashboard']);
    this.func.enableAllButtons();
  }

  // Control what values to show by toggling betweeen sign up and login
  alternateSignupLogin(): void {
    this.errorText = '';
    this.resetForm();
    document.querySelector('#signin')?.classList.toggle('hidden');
    document.querySelector('#signup')?.classList.toggle('hidden');
    document.querySelector('#create-account')?.classList.toggle('hidden');
    document.querySelector('#phone-section')?.classList.toggle('hidden');
    document
      .querySelector('#forgot-password-section')
      ?.classList.toggle('hidden');
    document.querySelector('#create-login-account')?.classList.toggle('hidden');
  }

  // Control what values to show by toggling betweeen forgot password and login
  alternateForgotPasswordLogin(): void {
    this.errorText = '';
    this.resetForm();
    document.querySelector('#password-recover')?.classList.toggle('hidden');
    document.querySelector('#signin')?.classList.toggle('hidden');
    document.querySelector('#password-section')?.classList.toggle('hidden');
    document.querySelector('#create-account')?.classList.toggle('hidden');
    document.querySelector('#forgot-login-account')?.classList.toggle('hidden');
  }

  // Custom function to control the phone number formatting while inputting
  phoneFormatter(event: Event): void {
    const keyEvent = event as unknown as KeyboardEvent;
    // Get phone number value
    const phone = document.querySelector(
      '#login-phone'
    ) as unknown as HTMLInputElement;
    const phoneValue = phone.value;
    const phoneLength = phoneValue.length;
    const isNumber = /^[0-9]$/i.test(keyEvent.key);

    // Check if key pressed is a number and format accordingly
    if (!isNumber) {
      event.preventDefault();
    } else if (phoneLength === 3) {
      phone.value = `(${phoneValue}) `;
    } else if (phoneLength === 9) {
      phone.value = `${phoneValue}-`;
    }
  }

  // Function to check if user is already logged in and route to dashboard
  // instead of showing login page
  checkAuth(): void {
    this.api.me().subscribe({
      next: () => {
        this.isAuth = true;
        this.routeToDashboard();
      },
      error: () => {
        this.isInit = true;
        this.func.enableAllButtons();
      },
    });
  }

  // Helper function to get first form value
  getFirstFormValue(): string {
    const firstVal = document.querySelector(
      '#login-username'
    ) as unknown as HTMLInputElement;

    return firstVal.value;
  }

  // Helper function to get second form value
  getSecondFormValue(): string {
    const secondVal = document.querySelector(
      '#login-password'
    ) as unknown as HTMLInputElement;

    return secondVal.value;
  }

  // Helper function to get third form value
  getThirdFormValue(): string {
    const thirdVal = document.querySelector(
      '#login-phone'
    ) as unknown as HTMLInputElement;

    return thirdVal.value;
  }

  // Helper function to display error messages
  handleError(error: string): void {
    this.resetForm();
    this.errorText = 'Error: ' + error;
    document.querySelector('#error-message')?.classList.remove('hidden');
    this.func.enableAllButtons();
  }
}
