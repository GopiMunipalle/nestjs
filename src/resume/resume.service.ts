import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume, Experience, Education, Project, Award, Certification } from './resume.entity';
import { CreateResumeDto } from './dto/create-resume.dto';


@Injectable()
export class ResumeService {
    constructor(
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
    ) { }

    async createResume(createResumeDto: CreateResumeDto): Promise<Resume> {
        const { experience, education, projects, awards, certifications, ...resumeData } = createResumeDto;

        const resume = this.resumeRepository.create(resumeData);

        // Save the resume first to establish the primary key
        const savedResume = await this.resumeRepository.save(resume);

        // Save related entities
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

        return savedResume;
    }
}
