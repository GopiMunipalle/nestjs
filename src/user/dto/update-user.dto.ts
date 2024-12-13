import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class UpdateUserDto {
    @IsInt()
    @Min(1)
    id: number;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    password?: string;
}
