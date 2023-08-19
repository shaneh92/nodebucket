/**
 * Title: security.service.ts
 * Author: Shane Hingtgen
 * Date: 8/15/23
 */

// import statements
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})

// security service class that makes a call to our API to get an employee by ID
export class SecurityService {
  constructor(private http: HttpClient) {}
  findEmployeeById(empId: number) {
    return this.http.get('/api/employees/' + empId);
  }
}
