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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      url: 'postgresql://neondb_owner:y8GtHWPfanp9@ep-plain-mode-a5uiixtb.us-east-2.aws.neon.tech/pg?sslmode=require',
      port: 5432,
      database: 'pg',
      entities: [User],
      synchronize: true,
      logging: false
    }),
    UserModule,
    ChatModule
  ],
  controllers: [AppController],
  providers: [AppService, EventsGateway],
})
export class AppModule { }