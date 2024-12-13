import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { errorResponse, Role, userResponse } from './user.entity';
import { createUserDto } from './dto/create-user.dto';
import { loginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { RolesGuard } from 'src/guards/role-guard';
import { Roles } from 'src/user-role/user-role.decorator';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    async getAllUsers(): Promise<userResponse[] | errorResponse> {
        return this.userService.findAll()
    }

    @Get('/one')
    @Roles('ADMIN', 'CUSTOMER', 'GUARD', 'SOCIETY_MEMBER', 'SOCIETY_ADMIN')
    @UseGuards(RolesGuard)
    @UseGuards(JwtAuthGuard)
    async getSingleUser(@Req() req: Request): Promise<userResponse | errorResponse> {
        const userId = req['user'].id
        return this.userService.findOne(userId)
    }

    @Post('/signUp')
    async signUpUser(@Body() body: createUserDto): Promise<userResponse | errorResponse> {
        return this.userService.signUp(body.name, body.email, body.password, body.role);
    }

    @Post()
    async loginUser(@Body() body: loginUserDto): Promise<userResponse | errorResponse> {
        return this.userService.login(body.email, body.password)
    }

    @Put()
    async updateUser(@Body() body: UpdateUserDto) {
        return this.userService.updateUser(body.id, body.email, body.name, body.password)
    }

    @Delete()
    @UseGuards(JwtAuthGuard)
    @Roles('CUSTOMER', 'ADMIN', 'GUARD', 'SOCIETY_MEMBER', 'SOCIETY_ADMIN')
    @UseGuards(RolesGuard)
    async removeUser(@Param() req: Request) {
        const id = req['user'].id
        return this.userService.removeUser(id)
    }
}
