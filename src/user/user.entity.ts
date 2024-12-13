import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum Role {
    CUSTOMER = 'CUSTOMER',
    ADMIN = 'ADMIN',
    SOCIETY_ADMIN = 'SOCIETY_ADMIN',
    SOCIETY_MEMBER = 'SOCIETY_MEMBER',
    GUARD = 'GUARD'
}

@Entity()
export default class User {
    @PrimaryGeneratedColumn()
    id: number
    @Column()
    name: string
    @Column()
    email: string
    @Column()
    password: string
    @Column({ default: true })
    isActive: boolean
    @Column({ type: 'enum', enum: Role })
    role: Role
    @CreateDateColumn()
    createdAt: Date
    @UpdateDateColumn()
    updatedAt: Date
}

export class userResponseData {
    id: number
    name: string
    email: string
    role: Role
    token?: string
    createdAt: Date
    updatedAt: Date
}

export class userResponse {
    data: userResponseData
}


export class error {
    status: number
    error: string
}

export class errorResponse {
    data: error
}