import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ExperienceDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsNotEmpty()
    startDate: Date;

    @IsOptional()
    endDate: Date;

    @IsOptional()
    currentlyWorking: boolean;
}

class EducationDto {
    @IsString()
    school: string;

    @IsString()
    degree: string;

    @IsNotEmpty()
    startDate: Date;

    @IsOptional()
    endDate: Date;

    @IsOptional()
    currentlyWorking: boolean;

    @IsOptional()
    percentage: number;
}

class ProjectDto {
    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsNotEmpty()
    startDate: Date;

    @IsOptional()
    endDate: Date;

    @IsOptional()
    currentlyWorking: boolean;

    @IsOptional()
    link: string;

    @IsOptional()
    technologies: string;
}

class AwardDto {
    @IsString()
    title: string;

    @IsString()
    description: string;
}

class CertificationDto {
    @IsString()
    title: string;

    @IsString()
    description: string;
}

export class CreateResumeDto {
    @IsNotEmpty()
    userId: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExperienceDto)
    experience: ExperienceDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EducationDto)
    education: EducationDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProjectDto)
    projects: ProjectDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AwardDto)
    awards: AwardDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CertificationDto)
    certifications: CertificationDto[];

    @IsArray()
    @IsString({ each: true })
    skills: string[];
}
