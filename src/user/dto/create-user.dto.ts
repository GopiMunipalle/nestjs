import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from '../user.entity';

export class createUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  password: string;
  @IsString()
  @IsOptional()
  number: string;
  @IsString()
  @IsOptional()
  linkedinUrl: string;
  @IsString()
  @IsOptional()
  githubUrl: string;
  @IsEnum(Role)
  @IsString()
  @IsNotEmpty()
  role: Role;
}
