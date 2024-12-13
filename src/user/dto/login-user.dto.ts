import { IsString, IsEmail, IsNotEmpty } from "class-validator";

export class loginUserDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string
    @IsNotEmpty()
    @IsString()
    password: string
}