import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '@prisma/client';
// import { UserService } from '../user/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    console.log(request.user.roles);
    if (request?.user) {
      // const user = await this.userService.getUserById(id);
      return (
        roles.includes(request.user.roles) ||
        request.user.roles == Roles.superadmin
      );
    }

    return false;
  }
}
