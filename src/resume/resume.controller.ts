import { Body, Controller, Get, Param, Post, Render, Req, UseGuards } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { Response, Request } from 'express';
import { CreateResumeDto } from './dto/create-resume.dto';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/role-guard';
import { Roles } from 'src/user-role/user-role.decorator';

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

    @Get('/all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CUSTOMER', 'ADMIN', 'GUARD', 'SOCIETY_MEMBER', 'SOCIETY_ADMIN')
    async getAllResume(@Req() req: Request) {
        const userId = req['user'].id;
        return this.resumeService.findAllWithRelations(userId);
    }

    @Get('/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CUSTOMER', 'ADMIN', 'GUARD', 'SOCIETY_MEMBER', 'SOCIETY_ADMIN')
    async getOneResume(@Param('id') id: number) {
        return this.resumeService.findOneWithRelations(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('CUSTOMER', 'ADMIN', 'GUARD', 'SOCIETY_MEMBER', 'SOCIETY_ADMIN')
    async generateResume(@Body() createResumeDto: CreateResumeDto, @Req() req: Request) {
        const userId = req['user'].id;
        return this.resumeService.createResume(createResumeDto, userId);
    }

}
