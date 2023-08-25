/**
 * Title: tasks-service.ts
 * Author: Shane Hingtgen
 * Date: 8/24/23
 */

// a service for building our tasks, makes calls from the db
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Item } from './tasks/item.interface';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private http: HttpClient) {}

  // this will get the employee from our empId
  getTask(empId: number) {
    return this.http.get('/api/employees/' + empId + '/tasks');
  }

  // this will make a post to our dp, and add a task
  addTask(empId: number, task: Item) {
    return this.http.post('/api/employees/' + empId + '/tasks', { task });
  }
}
