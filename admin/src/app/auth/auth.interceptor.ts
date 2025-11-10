import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AdminService } from '../_service/admin.service';
import Swal from 'sweetalert2';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private router: Router, private adminService: AdminService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const token = this.adminService.getTokenData() && this.adminService.getTokenData().token;

        // Clone the request to add the authorization header
        const clonedReq = req.clone({
            setHeaders: {
                Authorization: `${token}`
            }
        });

        // Handle the request and catch errors globally
        return next.handle(clonedReq).pipe(
            catchError((error) => {
                if (error.status === 401) {
                    // if (this.router.url != '/login') {
                    //     this.adminService.removeTokenData();
                    //     // this.adminService.isSessionExpire = true;
                    // } else {
                    //     this.adminService.removeTokenData();
                    //     this.router.navigate(['/login']);
                    // }

                    Swal.fire({
                        icon: 'warning',
                        title: 'Session Expired',
                        text: 'Please login again.',
                        confirmButtonColor: "#0083FF",
                        confirmButtonText: 'OK'
                    }).then(() => {
                        this.adminService.removeTokenData();
                        this.router.navigate(['/login']);
                    });
                }
                return throwError(error); // Re-throw the error
                // throw error;  
            })
        );
    }

}
