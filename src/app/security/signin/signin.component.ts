/**
 * Title: signin.component.ts
 * Author: Shane Hingtgen
 * Date: 8/15/23
 */

// imports statements
import { SecurityService } from './../security.service';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

// session user interface declarations to tell what type our properties are
export interface SessionUser {
  empId: number;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})

// signin component class that handles the signin functionality
export class SigninComponent {
  errorMessage: string;
  sessionUser: SessionUser;
  isLoading: boolean = false;

  signinForm = this.fb.group({
    empId: [
      null,
      Validators.compose([Validators.required, Validators.pattern('^[0-9]*$')]),
    ],
  });

  // constructor that injects our dependencies
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cookieService: CookieService,
    private secService: SecurityService,
    private route: ActivatedRoute
  ) {
    this.sessionUser = {} as SessionUser;
    this.errorMessage = '';
  }

  // signin function that handles the signin functionality
  signin() {
    this.isLoading = true;
    const empId = this.signinForm.controls['empId'].value;

    if (!empId || isNaN(parseInt(empId, 10))) {
      this.errorMessage =
        'The employee ID you entered is invalid, please try again';
      this.isLoading = false;
      return;
    }

    // call to our API to get an employee by ID
    this.secService.findEmployeeById(empId).subscribe({
      next: (employee: any) => {
        this.sessionUser = employee;
        this.cookieService.set('session_user', empId, 1);
        this.cookieService.set(
          'session_name',
          `${employee.firstName} ${employee.lastName}`,
          1
        );

        // this is the return url after the user logs in
        const returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl') ||
          'task-management/my-tasks';

        this.isLoading = false;

        this.router.navigate([returnUrl]);
      },
      // error handling
      error: (err) => {
        this.isLoading = false;

        if (err.error.message) {
          this.errorMessage = err.error.message;
          return;
        }

        this.errorMessage = err.message;
      },
    });
  }
}
