import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import User from './user/user.entity';
import { ChatModule } from './chat/chat.module';
import { EventsGateway } from './events/events.gateway';
import { ResumeModule } from './resume/resume.module';
import {
  Experience,
  Resume,
  Education,
  Project,
  Award,
  Certification,
} from './resume/resume.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonLoggerService } from './loggers/winstone-logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.development.local',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT'), 10),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        url: configService.get<string>('DB_URL'),
        entities: [
          User,
          Resume,
          Experience,
          Education,
          Project,
          Award,
          Certification,
        ],
        synchronize: true,
        // migrations: ['src/migration/*.ts'],
        logging: false,
      }),
      inject: [ConfigService],
    }),
    UserModule,
    ChatModule,
    ResumeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EventsGateway,
    {
      provide: 'LoggerService',
      useClass: WinstonLoggerService,
    },
  ],
  exports: ['LoggerService'],
})
export class AppModule {}
