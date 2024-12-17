import { Logger, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import User from './user/user.entity';
import { UserService } from './user/user.service';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';
import { ChatModule } from './chat/chat.module';
import { EventsGateway } from './events/events.gateway';
import { ResumeService } from './resume/resume.service';
import { ResumeController } from './resume/resume.controller';
import { ResumeModule } from './resume/resume.module';
import { Experience, Resume, Education, Project, Award, Certification } from './resume/resume.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      url: 'postgresql://neondb_owner:y8GtHWPfanp9@ep-plain-mode-a5uiixtb.us-east-2.aws.neon.tech/pg?sslmode=require',
      port: 5432,
      database: 'pg',
      entities: [User, Resume, Experience, Education, Project, Award, Certification],
      synchronize: true,
      logging: true
    }),
    UserModule,
    ChatModule,
    ResumeModule
  ],
  controllers: [AppController,],
  providers: [AppService, EventsGateway,],
})
export class AppModule { }