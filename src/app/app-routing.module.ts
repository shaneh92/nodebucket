/**
 * Title: app-routing.module.ts
 * Author: Professor Krasso
 * Modified by: Shane Hingtgen
 * Date: 8/15/23
 */

// import statements
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BaseLayoutComponent } from './layouts/base-layout/base-layout.component';
import { HomeComponent } from './home/home.component';
import { authGuard } from './shared/auth.guard';
import { ContactComponent } from './contact/contact.component';
import { AboutComponent } from './about/about.component';
import { NotFoundComponent } from './not-found/not-found.component';

// these are our routes to tell our app where to go when a user clicks on a link
const routes: Routes = [
  {
    path: '',
    component: BaseLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
        title: 'Nodebucket: Home',
      },
      {
        path: 'home',
        component: HomeComponent,
        title: 'Nodebucket: Home',
      },
      {
        path: 'contact',
        component: ContactComponent,
        title: 'Nodebucket: Contact Us',
      },
      {
        path: 'about',
        component: AboutComponent,
        title: 'Nodebucket: About Us',
      },
      {
        path: 'not-found',
        component: NotFoundComponent,
        title: 'Nodebucket: 404',
      },
      {
        path: 'task-management',
        loadChildren: () =>
          import('./task-management/task-management.module').then(
            (m) => m.TaskManagementModule
          ),
        // authGuard is a custom guard that we created to protect our route from being accessed by unauthorized users
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: 'security',
    loadChildren: () =>
      import('./security/security.module').then((m) => m.SecurityModule),
  },
  {
    //localhost:4200/asdjakjsdlja and other routes not listed will redirect to localhost:4200/not-found
    path: '**',
    redirectTo: 'not-found',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      enableTracing: false,
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
