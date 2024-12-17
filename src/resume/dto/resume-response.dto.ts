import exp from "constants";

class ResumeResponse {
    id: number;
    userId: number;
    experience: string;
    education: string;
    skills: string;
    projects: string;
    awards: string;
    certifications: string;
    createdAt: Date;
    updatedAt: Date;
}

export default class ResumeResponseDto {
    data: ResumeResponse
}