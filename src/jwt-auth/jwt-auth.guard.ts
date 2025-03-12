import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../user/user.service';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];
    if (!token) {
      throw new UnauthorizedException('Auth Token not found');
    }
    try {
      const decodedPayload = jwt.verify(
        token,
        process.env.JWT_SECRET_KEY,
      ) as jwt.JwtPayload;
      const userData = await this.userService.findOne(decodedPayload.id);

      if (!userData) {
        throw new ForbiddenException('User not found');
      }
      request['user'] = userData.data;
      return true;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      throw new ForbiddenException('Token validation failed');
    }
  }
}
