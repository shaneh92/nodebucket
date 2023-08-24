/**
 * Title: task-management.module.ts
 * Author: Shane Hingtgen
 * Date: 8/15/23
 */
// import statements
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// added for our employee interface modules
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { TaskManagementRoutingModule } from './task-management-routing.module';
import { TaskManagementComponent } from './task-management.component';
import { TasksComponent } from './tasks/tasks.component';

@NgModule({
  declarations: [TaskManagementComponent, TasksComponent],
  imports: [
    CommonModule,
    TaskManagementRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
})
export class TaskManagementModule {}
