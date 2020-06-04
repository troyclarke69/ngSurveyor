import { Injectable } from "@angular/core";
import {
    HttpEvent,
    HttpRequest,
    HttpHandler,
    HttpInterceptor,
    HttpErrorResponse,
    HttpResponse } from "@angular/common/http";
import { AuthenticationService } from "./authentication.service";
import { isNullOrUndefined } from "util";

@Injectable()
export class UserRequestInterceptor implements HttpInterceptor {

    constructor(private authService: AuthenticationService) { }

    // interceptor transforms an outgoing request before passing it to the next interceptor
    intercept(req: HttpRequest<any>, next: HttpHandler) {
        // get the users access token using our helper function
        const accessToken = this.authService.getAccessToken();

        //console.log('accessToken ', accessToken);
        console.log(req.url.toString());
        console.log(next.handle(req));
        //if (req.url.includes("survey-take")) {
        //    console.log('survey-take ', accessToken);
        //}

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
    }
}
