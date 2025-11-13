import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private allowedRoles: string[] = []) {
    super();
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || !user) {
      throw err || new ForbiddenException('Invalid token');
    }

    // Role check yahan kar lo
    if (this.allowedRoles.length > 0 && !this.allowedRoles.includes(user.role)) {
      throw new ForbiddenException('You are not authorized to access this resource');
    }

    return user;
  }
}
