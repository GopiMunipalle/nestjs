import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const userRole = user?.role;
        if (!userRole) {
            throw new ForbiddenException('You do not have permission to access this resource');
        }
        if (roles.includes(userRole) || userRole === 'ADMIN') {
            return true;
        } else {
            throw new ForbiddenException('You do not have permission to access this resource');
        }
    }
}
