import { Component, OnInit } from '@angular/core';
import { AdminService } from '../_service/admin.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  showPassword: boolean = false;

  constructor(private adminService: AdminService, private router: Router, private toastr: ToastrService) { }

  ngOnInit() {
    document.title = 'Login | Your Task';
    if(this.adminService.getTokenData()){
      this.router.navigate(['/'])
    }
  }

  loginData = {
    email: 'admin@gmail.com',
    password: 'Admin@2025'
  }

  isLoading: boolean = false;

  login(form: any) {
    if (form.valid) {
      this.isLoading = true;

      this.adminService.login(this.loginData).subscribe(
        (response: any) => {
          if (response.success == 1) {
            this.adminService.setTokenData(response.data);
            this.toastr.success(response.message);
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 500);
          } else {
            this.toastr.error(response.message);
          }
          setTimeout(() => {
            this.isLoading = false;
          }, 500);
        }
      )
    }
    else {
      // console.log('Form is invalid.');
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

}
