/**
 * Title: task-management.module.ts
 * Author: Shane Hingtgen
 * Date: 8/15/23
 */

// imports statements
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskManagementComponent } from './task-management.component';
import { TasksComponent } from './tasks/tasks.component';

// routes for our task management module
const routes: Routes = [
  {
    path: '',
    component: TaskManagementComponent,
    children: [
      {
        path: 'my-tasks',
        component: TasksComponent,
        title: 'Nodebucket: My Tasks',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TaskManagementRoutingModule {}
