import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './chat.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
    constructor(@InjectRepository(Chat)
    private chatRepository: Repository<Chat>
    ) { }

    async getAllChats(): Promise<Chat[]> {
        return this.chatRepository.find()
    }
}
