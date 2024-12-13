import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Chat {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    senderId: number;
    @Column()
    receiverId: number;
    @Column()
    message: string
    @CreateDateColumn()
    createdAt: Date;
    @UpdateDateColumn()
    updatedAt: Date;
}