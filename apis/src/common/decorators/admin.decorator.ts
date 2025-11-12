import { CanActivate, ExecutionContext, ForbiddenException, mixin, Type } from '@nestjs/common';

export function RoleGuard(role: string): Type<CanActivate> {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user) {
        throw new ForbiddenException('User not found in request');
      }

      if (user.user_type !== role) {
        console.log(user)
        throw new ForbiddenException(`Access denied: Only ${user} can access this route....`);
      }

      return true;
    }
  }

  return mixin(RoleGuardMixin);
}
