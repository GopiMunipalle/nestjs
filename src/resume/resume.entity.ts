import User from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Resume {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.resumes)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  summary: string;

  @OneToMany(() => Experience, (experience) => experience.resume, {
    cascade: true,
  })
  experience: Experience[];

  @OneToMany(() => Education, (education) => education.resume, {
    cascade: true,
  })
  education: Education[];

  @OneToMany(() => Project, (project) => project.resume, { cascade: true })
  projects: Project[];

  @OneToMany(() => Award, (award) => award.resume, { cascade: true })
  awards: Award[];

  @OneToMany(() => Certification, (certification) => certification.resume, {
    cascade: true,
  })
  certifications: Certification[];

  @Column({ type: 'text', array: true })
  skills: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
@Entity()
export class Experience {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ default: false })
  currentlyWorking: boolean;

  @ManyToOne(() => Resume, (resume) => resume.experience)
  resume: Resume;
}

@Entity()
export class Education {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  school: string;

  @Column()
  degree: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ default: false })
  currentlyWorking: boolean;

  @Column({ type: 'float', nullable: true })
  percentage: number;

  @ManyToOne(() => Resume, (resume) => resume.education)
  resume: Resume;
}

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ default: false })
  currentlyWorking: boolean;

  @Column({ nullable: true })
  link: string;

  @Column({ nullable: true })
  technologies: string;

  @ManyToOne(() => Resume, (resume) => resume.projects)
  resume: Resume;
}

@Entity()
export class Award {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => Resume, (resume) => resume.awards)
  resume: Resume;
}

@Entity()
export class Certification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => Resume, (resume) => resume.certifications)
  resume: Resume;
}
