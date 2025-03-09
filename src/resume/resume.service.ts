import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Resume,
  Experience,
  Education,
  Project,
  Award,
  Certification,
} from './resume.entity';
import { CreateResumeDto } from './dto/create-resume.dto';
import User, { errorResponse } from 'src/user/user.entity';
import { Request } from 'express';
import UpdateResumeDto from './dto/update-resume.dto';

@Injectable()
export class ResumeService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    @InjectRepository(Experience)
    private readonly experienceRepository: Repository<Experience>,
    @InjectRepository(Education)
    private readonly educationRepository: Repository<Education>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Award)
    private readonly awardRepository: Repository<Award>,
    @InjectRepository(Certification)
    private readonly certificationRepository: Repository<Certification>,
    private readonly logger: Logger,
  ) {}
  async createResume(
    createResumeDto: CreateResumeDto,
    userId: number,
  ): Promise<Resume | errorResponse> {
    try {
      const {
        experience,
        education,
        projects,
        awards,
        certifications,
        ...resumeData
      } = createResumeDto;
      const resume = this.resumeRepository.create(resumeData);

      const savedResume = await this.resumeRepository.save(resume);

      if (experience && experience.length > 0) {
        const experiences = this.experienceRepository.create(
          experience.map((exp) => ({ ...exp, resume: savedResume })),
        );
        await this.experienceRepository.save(experiences);
      }

      if (education) {
        const educations = this.educationRepository.create(
          education.map((edu) => ({ ...edu, resume: savedResume })),
        );
        await this.educationRepository.save(educations);
      }

      if (projects && projects.length > 0) {
        const projectEntities = this.projectRepository.create(
          projects.map((project) => ({ ...project, resume: savedResume })),
        );
        await this.projectRepository.save(projectEntities);
      }

      if (awards) {
        const awardEntities = this.awardRepository.create(
          awards.map((award) => ({ ...award, resume: savedResume })),
        );
        await this.awardRepository.save(awardEntities);
      }

      if (certifications) {
        const certificationEntities = this.certificationRepository.create(
          certifications.map((cert) => ({ ...cert, resume: savedResume })),
        );
        await this.certificationRepository.save(certificationEntities);
      }
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['resumes'],
      });

      if (user) {
        user.name = resumeData.name || user.name;
        user.number = resumeData.number || user.number;
        user.linkedinUrl = resumeData.linkedinUrl || user.linkedinUrl;
        user.githubUrl = resumeData.githubUrl || user.githubUrl;
        user.resumes.push(savedResume);
        await this.userRepository.save(user);
      }
      const resumeDoc = await this.resumeRepository.findOne({
        where: { id: savedResume.id },
        relations: [
          'experience',
          'education',
          'projects',
          'awards',
          'certifications',
          'user',
        ],
      });
      return resumeDoc;
    } catch (error) {
      return {
        data: {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
      };
    }
  }

  async updateResume(
    createResumeDto: UpdateResumeDto,
    id: number,
  ): Promise<Resume | errorResponse> {
    try {
      const {
        name,
        number,
        linkedinUrl,
        githubUrl,
        selectedTemplate,
        skills,
        summary,
        experience,
        projects,
        education,
        resumeId,
      } = createResumeDto;
      const userDoc = await this.userRepository.findOne({ where: { id } });
      if (!userDoc) {
        this.logger.warn('Resume not found');
        return {
          data: {
            error: 'Resume not found',
            status: HttpStatus.NOT_FOUND,
          },
        };
      }

      const resumeDoc = await this.resumeRepository.findOne({
        where: { id: resumeId },
      });

      if (name) userDoc.name = name;
      if (linkedinUrl) userDoc.linkedinUrl = linkedinUrl;
      if (githubUrl) userDoc.githubUrl = githubUrl;
      if (number) userDoc.number = number;

      if (summary) resumeDoc.summary = summary;
      if (selectedTemplate) resumeDoc.selectedTemplate = selectedTemplate;
      if (skills && skills.length > 0) resumeDoc.skills = skills;

      if (experience) {
        const experienceDoc = await this.experienceRepository.find({
          where: { resume: { id: resumeId } },
        });

        if (experienceDoc.length > 0) {
          await this.experienceRepository.remove(experienceDoc);
        }

        if (experience.length > 0) {
          const experienceEntities = this.experienceRepository.create(
            experience.map((exp) => ({ ...exp, resume: resumeDoc })),
          );
          await this.experienceRepository.save(experienceEntities);
        }
      }

      if (projects) {
        const projectDoc = await this.projectRepository.find({
          where: { resume: { id: resumeId } },
        });
        if (projectDoc.length > 0) {
          await this.projectRepository.remove(projectDoc);
        }
        if (projects.length > 0) {
          const projectEntities = this.projectRepository.create(
            projects.map((project) => ({ ...project, resume: resumeDoc })),
          );
          await this.projectRepository.save(projectEntities);
        }
      }

      if (education) {
        const educationDoc = await this.educationRepository.find({
          where: { resume: { id: resumeId } },
        });
        if (educationDoc.length > 0) {
          await this.educationRepository.remove(educationDoc);
        }
        if (education.length > 0) {
          const educations = this.educationRepository.create(
            education.map((edu) => ({ ...edu, resume: resumeDoc })),
          );
          await this.educationRepository.save(educations);
        }
      }

      await this.resumeRepository.save(resumeDoc);
      await this.userRepository.save(userDoc);
      const savedResume = await this.resumeRepository.findOne({
        where: { id: resumeDoc.id },
        relations: [
          'experience',
          'education',
          'projects',
          'awards',
          'certifications',
          'user',
        ],
      });
      return savedResume;
    } catch (error) {
      return {
        data: {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
      };
    }
  }

  async findAllWithRelations(
    id: number,
    req: Request,
  ): Promise<any | errorResponse> {
    try {
      const resume = await this.userRepository.find({
        where: { id },
        relations: [
          'resumes',
          'resumes.experience',
          'resumes.education',
          'resumes.projects',
          'resumes.awards',
          'resumes.certifications',
        ],
      });
      if (!resume) {
        this.logger.warn('Resumes not found', req.originalUrl);
        return {
          data: {
            error: 'Resumes not found',
            status: HttpStatus.NOT_FOUND,
          },
        };
      }
      this.logger.log('Resumes found' + req.originalUrl);
      return resume;
    } catch (error) {
      return {
        data: {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
      };
    }
  }

  async findOneWithRelations(id: number): Promise<any | errorResponse> {
    try {
      const resume = await this.resumeRepository.findOne({
        where: { id },
        relations: [
          'experience',
          'education',
          'projects',
          'awards',
          'certifications',
          'user',
        ],
      });
      if (!resume) {
        this.logger.warn('Resume not found');
        return {
          data: {
            error: 'Resume not found',
            status: HttpStatus.NOT_FOUND,
          },
        };
      }
      this.logger.log('Resume found');
      return resume;
    } catch (error) {
      return {
        data: {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
      };
    }
  }

  async deleteResume(id: number): Promise<any | errorResponse> {
    try {
      const resume = await this.resumeRepository.findOne({
        where: { id },
        relations: ['experience', 'education', 'projects'],
      });
      if (!resume) {
        return {
          data: {
            status: HttpStatus.NOT_FOUND,
            error: 'Resume not found',
          },
        };
      }
      await this.resumeRepository.manager.remove(resume.experience);
      await this.resumeRepository.manager.remove(resume.education);
      await this.resumeRepository.manager.remove(resume.projects);
      // await this.resumeRepository.manager.remove(resume.awards);
      // await this.resumeRepository.manager.remove(resume.certifications);

      await this.resumeRepository.remove(resume);
      return { status: 200, message: 'Resume deleted successfully' };
    } catch (error) {
      return {
        data: {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
      };
    }
  }
}
