import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { errorResponse, Role, userResponse } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { RolesGuard } from 'src/guards/role-guard';
import { Roles } from 'src/user-role/user-role.decorator';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/all')
  async getAllUsers(): Promise<userResponse[] | errorResponse> {
    return this.userService.findAll();
  }

  @Get('/')
  @Roles('ADMIN', 'CUSTOMER')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  async getSingleUser(
    @Req() req: Request,
  ): Promise<userResponse | errorResponse> {
    const userId = req['user'].id;
    return this.userService.findOne(userId);
  }

  @Post('/signup')
  async signUpUser(
    @Body() body: { email: string },
  ): Promise<{ data: { status: number; message: string } } | errorResponse> {
    return this.userService.registerWithEmail(body.email);
  }

  @Post('/login')
  async Login(
    @Body() body: { email: string; otp: string },
  ): Promise<userResponse | errorResponse> {
    return this.userService.login(body.email, body.otp);
  }

  @Put('/')
  @UseGuards(JwtAuthGuard)
  @Roles('CUSTOMER', 'ADMIN')
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updateUser(@Body() body: UpdateUserDto, @Req() req: Request) {
    const id = req['user'].id;
    return this.userService.updateUser(
      id,
      body.email,
      body.name,
      body.githubUrl,
      body.linkedinUrl,
      body.number,
    );
  }

  @Delete('/remove')
  @Roles('CUSTOMER', 'ADMIN')
  // @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  async removeUser(@Req() req: Request) {
    const id = req['user'].id;
    return this.userService.removeUser(id);
  }
}
