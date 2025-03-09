import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import {
  Education,
  Experience,
  Project,
  Resume,
} from 'src/resume/resume.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Resume, Experience, Project, Education]),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
