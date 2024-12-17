import { Body, Controller, Get, Post, Render, UseGuards } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { Response, Request } from 'express';
import { CreateResumeDto } from './dto/create-resume.dto';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';

@Controller('resume')
export class ResumeController {
    constructor(private readonly resumeService: ResumeService) { }

    @Get('/generate')
    @Render('template')
    generateTemplate(@Body() userData: any, res: Response) {
        const data = {
            name: 'Ankit',
            email: 'gM4o2@example.com',
            experience: 'some experience',
            education: 'some education',
        }
        return data
    }

    @Post('/save')
    @UseGuards(JwtAuthGuard)

    async saveResumeDetails(@Body() body: CreateResumeDto, req: Request) {
        this.resumeService.createResume(body)
    }
    @Post()
    async createResume(@Body() createResumeDto: CreateResumeDto) {
        return this.resumeService.createResume(createResumeDto);
    }
}
