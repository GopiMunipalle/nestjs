import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Resume,
  Experience,
  Education,
  Project,
  Award,
  Certification,
} from './resume.entity';
import { ResumeService } from './resume.service';
import { ResumeController } from './resume.controller';
import { UserModule } from 'src/user/user.module';
import User from 'src/user/user.entity';
import { WinstonModule } from 'nest-winston';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Resume,
      Experience,
      Education,
      Project,
      Award,
      Certification,
      User,
    ]),
    UserModule,
    WinstonModule,
  ],
  controllers: [ResumeController],
  providers: [
    ResumeService,
    {
      provide: Logger,
      useValue: new Logger('ResumeModule'),
    },
  ],
  exports: [ResumeService],
})
export class ResumeModule {}
