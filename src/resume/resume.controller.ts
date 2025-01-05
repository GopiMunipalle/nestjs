import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Render,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ResumeService } from './resume.service';
import { Response, Request } from 'express';
import { CreateResumeDto } from './dto/create-resume.dto';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/guards/role-guard';
import { Roles } from 'src/user-role/user-role.decorator';
import { errorResponse } from 'src/user/user.entity';
import ResumeResponseDto from './dto/resume-response.dto';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Get('/generate')
  @Render('template')
  generateTemplate(@Body() userData: any, res: Response) {
    const data = {
      name: 'Ankit',
      email: 'gM4o2@example.com',
      experience: 'some experience',
      education: 'some education',
    };
    return data;
  }

  @Get('/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER', 'ADMIN')
  async getAllResume(
    @Req() req: Request,
  ): Promise<ResumeResponseDto | errorResponse> {
    const userId = req['user'].id;
    return this.resumeService.findAllWithRelations(userId, req);
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER', 'ADMIN')
  async getOneResume(@Param('id') id: number): Promise<any | errorResponse> {
    return this.resumeService.findOneWithRelations(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CUSTOMER', 'ADMIN')
  async generateResume(
    @Body() createResumeDto: CreateResumeDto,
    @Req() req: Request,
  ): Promise<any | errorResponse> {
    console.log('resume data', createResumeDto);
    const userId = req['user'].id;
    return this.resumeService.createResume(createResumeDto, userId);
  }
}
