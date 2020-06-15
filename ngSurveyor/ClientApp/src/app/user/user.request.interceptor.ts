import { Injectable } from "@angular/core";
import { HttpEvent, HttpRequest, HttpHandler, HttpInterceptor, HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { AuthenticationService } from "./authentication.service";
import { isNullOrUndefined } from "util";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
//import { ToastrService } from "ngx-toastr";

@Injectable()
export class UserRequestInterceptor implements HttpInterceptor {

    constructor(private authService: AuthenticationService) { }

    // interceptor transforms an outgoing request before passing it to the next interceptor
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // get the users access token using our helper function
        const accessToken = this.authService.getAccessToken();

        //console.log('accessToken', accessToken);
        //console.log('url ', req.url.toString());

        // in case it isn't set
        if (isNullOrUndefined(accessToken))
            return next.handle(req);

        // set the header
        req = req.clone({
            setHeaders: {
                Authorization: "Bearer " + accessToken
            }
        });

        return next.handle(req);
        //return next.handle(req).pipe(tap((event: HttpEvent<any>) => {
        //    if (event instanceof HttpResponse && event.status === 201) {
        //        this.toastr.success("Object created.");
        //    }
        //})
        //);
    }
}
