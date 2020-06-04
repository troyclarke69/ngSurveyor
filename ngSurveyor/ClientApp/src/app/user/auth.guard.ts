import { Injectable } from "@angular/core";
import { AuthenticationService } from "./authentication.service";
import { Observable, of } from "rxjs";
import { tap } from 'rxjs/operators';
import { map, catchError } from "rxjs/operators";
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Router, RouterStateSnapshot } from "@angular/router";
import { isLoweredSymbol } from "@angular/compiler";

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthenticationService, private router: Router) { }

    canActivate(): boolean {

        if (!this.authService.isLoggedIn) {
            //console.log('AuthGuard ');
            this.router.navigate(['user/sign-in'], { queryParams: { msg: 'You must login to access the page' } });
            return false;
        };
        // console.log('canActive ', true);
        return true;
    }

    // canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    //   return this.authService.authenticate().pipe(
    //     map(active => {
    //       console.log('authguard.canActivate ', active['status']);
    //       return active['status'] == 'success';
    //       }
    //     )
    //   );
    // }

}
