import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { errorResponse, Role, userResponse } from './user.entity';
import { createUserDto } from './dto/create-user.dto';
import { loginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { RolesGuard } from 'src/guards/role-guard';
import { Roles } from 'src/user-role/user-role.decorator';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<userResponse[] | errorResponse> {
    return this.userService.findAll();
  }

  @Get('/one')
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
    @Body() body: createUserDto,
  ): Promise<userResponse | errorResponse> {
    return this.userService.signUp(
      body.name,
      body.email,
      body.password,
      body.role,
    );
  }

  @Post('/login')
  async loginUser(
    @Body() body: loginUserDto,
  ): Promise<userResponse | errorResponse> {
    return this.userService.login(body.email, body.password);
  }

  @Put('/update')
  @UseGuards(JwtAuthGuard)
  @Roles('CUSTOMER', 'ADMIN')
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updateUser(
    @Body() body: UpdateUserDto,
    @UploadedFile() profilePicture: Express.Multer.File,
    @Req() req: Request,
  ) {
    const id = req['user'].id;
    return this.userService.updateUser(
      id,
      body.email,
      body.name,
      body.password,
      body.githubUrl,
      body.linkedinUrl,
      body.number,
      profilePicture,
    );
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @Roles('CUSTOMER', 'ADMIN')
  @UseGuards(RolesGuard)
  async removeUser(@Param() req: Request) {
    const id = req['user'].id;
    return this.userService.removeUser(id);
  }
}
