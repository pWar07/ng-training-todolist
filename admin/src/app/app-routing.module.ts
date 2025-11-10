import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MasterComponent } from './master/master.component';
import { AuthGuard } from './auth/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TaskListComponent } from './tasks/task-list/task-list.component';
import { TaskAddComponent } from './tasks/task-add/task-add.component';


const routes: Routes = [
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "",
    component: MasterComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        redirectTo: "tasks",
        pathMatch: "full"
      },
      {
        path: "tasks",
        component: TaskListComponent,
        data: { title: 'Tasks', tabName: 'tasks' },
      },
      {
        path: "task/add",
        component: TaskAddComponent,
        data: { title: "Tasks", tabName: "tasks" }
      },
      {
        path: "task/update/:id",
        component: TaskAddComponent,
        data: { title: "Tasks", tabName: "tasks" }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
