import { Resume } from 'src/resume/resume.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Role {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name?: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  number?: string;

  @Column({ nullable: true })
  linkedinUrl?: string;

  @Column({ nullable: true })
  githubUrl?: string;

  @Column({ nullable: true })
  profilePicture?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: Role, default: Role.CUSTOMER })
  role: Role;

  @Column({ nullable: true })
  otp?: string;

  @OneToMany(() => Resume, (resume) => resume.user, { cascade: true })
  resumes: Resume[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export class userResponseData {
  name: string;
  email: string;
  id: number;
  role: string;
  number: string;
  linkedinUrl?: string;
  githubUrl?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
  token?: string;
  otp?: string;
}

export class userResponse {
  data: userResponseData;
}

export class error {
  status: number;
  error: string;
}

export class errorResponse {
  data: error;
}
