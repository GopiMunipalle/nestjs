import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume, Experience, Education, Project, Award, Certification } from './resume.entity';
import { CreateResumeDto } from './dto/create-resume.dto';
import User, { errorResponse } from 'src/user/user.entity';


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
        private readonly logger: Logger
    ) { }
    async createResume(createResumeDto: CreateResumeDto, userId: number): Promise<Resume | errorResponse> {
        try {
            const { experience, education, projects, awards, certifications, ...resumeData } = createResumeDto;

            const resume = this.resumeRepository.create(resumeData);

            const savedResume = await this.resumeRepository.save(resume);

            if (experience) {
                const experiences = this.experienceRepository.create(
                    experience.map(exp => ({ ...exp, resume: savedResume })),
                );
                await this.experienceRepository.save(experiences);
            }

            if (education) {
                const educations = this.educationRepository.create(
                    education.map(edu => ({ ...edu, resume: savedResume })),
                );
                await this.educationRepository.save(educations);
            }

            if (projects) {
                const projectEntities = this.projectRepository.create(
                    projects.map(project => ({ ...project, resume: savedResume })),
                );
                await this.projectRepository.save(projectEntities);
            }

            if (awards) {
                const awardEntities = this.awardRepository.create(
                    awards.map(award => ({ ...award, resume: savedResume })),
                );
                await this.awardRepository.save(awardEntities);
            }

            if (certifications) {
                const certificationEntities = this.certificationRepository.create(
                    certifications.map(cert => ({ ...cert, resume: savedResume })),
                );
                await this.certificationRepository.save(certificationEntities);
            }
            const user = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['resumes'],
            });

            if (user) {
                user.resumes.push(savedResume);
                await this.userRepository.save(user);
            }
            return savedResume;
        } catch (error) {
            return {
                data: {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: error.message
                }
            }
        }
    }

    async findAllWithRelations(id: number): Promise<any | errorResponse> {
        try {
            const resume = await this.userRepository.find({
                where: { id },
                relations: ['resumes',
                    'experience',
                    'education',
                    'projects',
                    'awards',
                    'certifications'
                ]
            })
            if (!resume) {
                return {
                    data: {
                        error: 'Resumes not found',
                        status: HttpStatus.NOT_FOUND
                    }
                }
            }
            return resume;
        } catch (error) {
            return {
                data: {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: error.message
                }
            }
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
                    "user"
                ]
            })
            if (!resume) {
                this.logger.warn('Resume not found',)
                return {
                    data: {
                        error: 'Resume not found',
                        status: HttpStatus.NOT_FOUND
                    }
                }
            }
            this.logger.log('Resume found')
            return resume
        } catch (error) {
            return {
                data: {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: error.message
                }
            }
        }
    }
}
