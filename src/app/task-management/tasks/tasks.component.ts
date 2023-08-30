/**
 * Title: tasks.component.ts
 * Modified by: Shane Hingtgen
 * Date: 8/24/23
 */

// imports
import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { TaskService } from '../task.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Employee } from './employee.interface';
import { Item } from './item.interface';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],
})
export class TasksComponent {
  // variables
  employee: Employee;
  empId: number;
  todo: Item[];
  done: Item[];
  errorMessage: string;
  successMessage: string;

  // building our new form for tasks, with length requirements
  newTaskForm: FormGroup = this.fb.group({
    text: [
      null,
      Validators.compose([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
    ],
    category: [null],
  });

  constructor(
    private cookieService: CookieService,
    private taskService: TaskService,
    private fb: FormBuilder
  ) {
    this.employee = {} as Employee;
    this.todo = [];
    this.done = [];
    this.errorMessage = '';
    this.successMessage = '';

    this.empId = parseInt(this.cookieService.get('session_user'), 10);

    // get the task by empId from the db, or show an error message
    this.taskService.getTask(this.empId).subscribe({
      next: (emp: any) => {
        console.log('emp', emp);
        this.employee = emp;
      },
      error: (err) => {
        console.log('error', err);
        this.errorMessage = err.message;
        this.hideAlert();
      },
      complete: () => {
        console.log('complete');

        this.todo = this.employee.todo ? this.employee.todo : [];
        this.done = this.employee.done ? this.employee.done : [];

        console.log('todo', this.todo);
        console.log('done', this.done);
      },
    });
  }

  // our function for creating new tasks and adding them to the todo list
  addTask() {
    const text = this.newTaskForm.controls['text'].value;
    const category = this.newTaskForm.controls['category'].value;

    if (!category) {
      this.errorMessage = 'Please select a category';
      this.hideAlert();
      return;
    }

    let newTask = this.getTask(text, category);

    // when posted it will either return an error or a message of success
    this.taskService.addTask(this.empId, newTask).subscribe({
      next: (task: any) => {
        console.log('Task added with id', task.id);
        newTask._id = task.id; //set the new task._id to the task.id

        this.todo.push(newTask);
        this.newTaskForm.reset();

        this.successMessage = 'Task added successfully';

        this.hideAlert();
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.hideAlert();
      },
    });
  }

  // this allows us to delete our tasks
  deleteTask(taskId: string) {
    console.log('Task Item: ', taskId);

    // if the user does not confirm the delete, it will not delete
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    // when deleted it will either return an error or a message of success
    this.taskService.deleteTask(this.empId, taskId).subscribe({
      next: (res: any) => {
        console.log('Task deleted with id: ', taskId);

        // Chris Gorham asked a very important question in teams which resulted in this change to allow for an empty array written by Prof Krasso
        if (this.todo) this.todo = []; //if todo array is null
        if (this.done) this.done = []; //if done array is null

        // filters under the arrays to find the correct id as a string, and checks its not taskId
        this.todo = this.todo.filter((t) => t._id?.toString() !== taskId);
        this.done = this.done.filter((t) => t._id?.toString() !== taskId);

        this.successMessage = 'Task deleted successfully';
        this.hideAlert();
      },
      error: (err) => {
        console.log('err', err);
        this.errorMessage = err.message;
        this.hideAlert();
      },
    });
  }

  // this will have an alert message for 3 seconds
  hideAlert() {
    setTimeout(() => {
      this.errorMessage = '';
      this.successMessage = '';
    }, 3000);
  }

  // this is getTask from the db and supply it with a color for our columns
  getTask(text: string, categoryName: string) {
    let task: Item = {} as Item;

    const white = '#FFFFFF';
    const green = '#4BCE97';
    const purple = '#9F8FEF';
    const red = '#F87462';

    // a switch statement for the categories and to set their colors
    switch (categoryName) {
      case 'testing':
        task = {
          text: text,
          category: {
            categoryName: categoryName,
            backgroundColor: green,
          },
        };
        return task;
      case 'meetings':
        task = {
          text: text,
          category: {
            categoryName: categoryName,
            backgroundColor: red,
          },
        };
        return task;
      case 'projects':
        task = {
          text: text,
          category: {
            categoryName: categoryName,
            backgroundColor: purple,
          },
        };
        return task;
      default:
        task = {
          text: text,
          category: {
            categoryName: categoryName,
            backgroundColor: white,
          },
        };
        return task;
    }
  }
}
