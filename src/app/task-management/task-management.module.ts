/**
 * Title: task-management.module.ts
 * Author: Shane Hingtgen
 * Date: 8/15/23
 */
// import statements
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TaskManagementRoutingModule } from './task-management-routing.module';
import { TaskManagementComponent } from './task-management.component';
import { TasksComponent } from './tasks/tasks.component';

@NgModule({
  declarations: [TaskManagementComponent, TasksComponent],
  imports: [CommonModule, TaskManagementRoutingModule],
})
export class TaskManagementModule {}
