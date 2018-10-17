import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
// import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}
  handleError(error: Error | HttpErrorResponse) {
    // const notificationService = this.injector.get(NotificationService);
    const toastr = this.injector.get(ToastrService);
    // const router = this.injector.get(Router);

    console.log(error);

    if (error instanceof HttpErrorResponse) {
      // Server or connection error happened
      if (!navigator.onLine) {
        // Handle offline error
        console.log('No Internet Connection');
        toastr.error('No Internet Connection');
      }
      // Handle Http Error (error.status === 403, 404...)
      // notificationService.notify(`${error.status} - ${error.message}`);
      // console.log(`${error.status} - ${error.message}`);
      // router.navigateByUrl('error');
    }
    // Handle Client Error (Angular Error, ReferenceError...)
    // Log the error anyway
    // router.navigateByUrl('error');
    // console.error('It happens: ', error);
  }
}
