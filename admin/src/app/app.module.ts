import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MasterComponent } from './master/master.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { ToastrModule } from 'ngx-toastr';
import { CKEditorModule } from 'ngx-ckeditor';
import { NgSelectModule } from '@ng-select/ng-select';
import { DatePipe } from '@angular/common';
import { PagerService } from './_service/pager-service';
import { TaskListComponent } from './tasks/task-list/task-list.component';
import { TaskAddComponent } from './tasks/task-add/task-add.component';

@NgModule({
  declarations: [
    AppComponent,
    MasterComponent,
    LoginComponent,
    DashboardComponent,
    TaskListComponent,
    TaskAddComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NgxDaterangepickerMd.forRoot(),
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      maxOpened: 1, // show only 1 toast at a time
      autoDismiss: true, // auto dismiss previous toast when a new one is shown
    }),
    CKEditorModule,
    NgSelectModule,
  ],
  providers: [
    PagerService,
    DatePipe,
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: AuthInterceptor,  // Register the interceptor
    //   multi: true                // Allows multiple interceptors
    // }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
