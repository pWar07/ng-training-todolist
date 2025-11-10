import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient, private router: Router) { }

  private apiUrl = environment.api; // Base API url
  private TOKEN_KEY = "auth_token";

  private getHttpOptions(type: string = "json") {
    let headers = new HttpHeaders();
    let token = this.getTokenData() && this.getTokenData().token;

    if (type == "json") {
      headers = headers.set("Content-Type", "application/json");
    }
    if (token) {
      headers = headers.set("Authorization", token);
    }

    return { headers };
  }

  setTokenData(tokenData: string) {
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokenData));
  }

  getTokenData() {
    return JSON.parse(localStorage.getItem(this.TOKEN_KEY));
  }

  removeTokenData() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  login(data: any): Observable<any> {
    data.from_app = true;
    return this.http
      .post<any>(
        this.apiUrl + "admin_services/login/with_password",
        JSON.stringify(data),
        this.getHttpOptions()
      )
      .pipe();
  }

  gettaskList(data: any): Observable<any> {
    data.from_app = true;
    return this.http
      .post<any>(
        this.apiUrl + "admin_services/manage_tasks/list",
        JSON.stringify(data),
        this.getHttpOptions()
      )
      .pipe();
  }

  deleteTask(data: any): Observable<any> {
    data.from_app = true;
    return this.http
      .post<any>(
        this.apiUrl + "admin_services/manage_tasks/delete",
        JSON.stringify(data),
        this.getHttpOptions()
      )
      .pipe();
  }

  savetask(data: any): Observable<any> {
    data.from_app = true;
    return this.http
      .post<any>(
        this.apiUrl + "admin_services/manage_tasks/save",
        JSON.stringify(data),
        this.getHttpOptions()
      )
      .pipe();
  }
  
  changeTaskStatus(data: any): Observable<any> {
    data.from_app = true;
    return this.http
      .post<any>(
        this.apiUrl + "admin_services/manage_tasks/change_status",
        JSON.stringify(data),
        this.getHttpOptions()
      )
      .pipe();
  }

  getuserList(data: any): Observable<any> {
    data.from_app = true;
    return this.http
      .post<any>(
        this.apiUrl + "admin_services/user_list",
        JSON.stringify(data),
        this.getHttpOptions()
      )
      .pipe();
  }

}
