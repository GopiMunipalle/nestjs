import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { Role } from "../user.entity";

export class createUserDto {
    @IsNotEmpty()
    @IsString()
    name: string
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    password: string
    @IsEnum(Role)
    @IsString()
    @IsNotEmpty()
    role: Role
}