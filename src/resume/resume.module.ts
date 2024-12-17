import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resume, Experience, Education, Project, Award, Certification } from './resume.entity';
import { ResumeService } from './resume.service';
import { ResumeController } from './resume.controller';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Resume, Experience, Education, Project, Award, Certification]),
        UserModule
    ],
    controllers: [ResumeController],
    providers: [ResumeService],
    exports: [ResumeService],
})
export class ResumeModule { }
