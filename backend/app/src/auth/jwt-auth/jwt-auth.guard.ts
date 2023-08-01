import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from './jwt-auth.strategy';
import { JwtAuthService } from './jwt-auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private JwtAuthService: JwtAuthService) {
    super();
  }
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    // Execute the canActivate method of the parent class (AuthGuard).
    const canActivate = super.canActivate(context);
    console.log('----- AT JWT-AUTH.GUARD -----');
    if (!canActivate) {
      return false;
    }

    console.log('----- END -----');
    // Get the request object from the context.
    const request = context.switchToHttp().getRequest();
    console.log('----- REQUEST -----', request.headers.cookie.split('='));

    const token = request.headers.cookie.split('=')[1];
    console.log('----- TOKEN -----', token);

    // this.JwtAuthService.verifyToken();

    // Check if the JWT payload contains is_2fa_enabled property.
    const jwtPayload: JwtPayload = request;
    // console.log("-------------------------------- jwtPayload: ", jwtPayload);
    // Here, you can add your own logic to check for 2FA authentication.
    // For example, you can check if is_2fa_enabled is true or false to determine
    // if it's a 2FA authenticated token or a normal token.

    // Example logic:
    if (
      jwtPayload.is_2fa_enabled === true &&
      jwtPayload.is_validated === false
    ) {
      // It's a 2FA authenticated token.
      // Implement your 2FA validation logic here.
      // Return false if 2FA validation fails and you want to deny access.
      // Otherwise, return true to allow access.
      // For example:
      // if (!validate2FA(jwtPayload)) {
      //   return false;
      // }
    } else {
      // It's a normal token.
      // Implement your normal token validation logic here.
      // Return false if normal token validation fails and you want to deny access.
      // Otherwise, return true to allow access.
      // For example:
      // if (!validateNormalToken(jwtPayload)) {
      //   return false;
      // }
    }

    return true;
  }
}
