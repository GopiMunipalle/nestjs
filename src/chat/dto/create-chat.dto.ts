import { IsString, IsNotEmpty } from "class-validator";

export class CreateChatDto {
    @IsNotEmpty()
    @IsString()
    senderId: string;
    @IsNotEmpty()
    @IsString()
    receiverId: string;
    @IsNotEmpty()
    @IsString()
    message: string
}