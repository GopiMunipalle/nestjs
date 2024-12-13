import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import User, { Role } from './user.entity';
import { HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken'
import { userResponse } from './user.entity';
import { errorResponse } from './user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async findAll(): Promise<userResponse[] | errorResponse> {
        try {
            const users = await this.userRepository.find();
            const formattedUsers = users.map(user => ({
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }))
            return formattedUsers
        } catch (error) {
            return {
                data: {
                    error,
                    status: HttpStatus.INTERNAL_SERVER_ERROR
                }
            }
        }
    }

    async findOne(id: number): Promise<userResponse | errorResponse> {
        try {
            const user = await this.userRepository.findOneOrFail({ where: { id } });
            if (!user) {
                return {
                    data: {
                        error: 'User not found',
                        status: HttpStatus.NOT_FOUND
                    }
                }
            }
            return {
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        } catch (error) {
            return {
                data: {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: error.message
                }
            }
        }
    }

    async signUp(name: string, email: string, password: string, role: Role): Promise<userResponse | errorResponse> {
        try {
            if (role === 'ADMIN') {
                return {
                    data: {
                        error: 'Admin role not allowed',
                        status: HttpStatus.BAD_REQUEST
                    }
                }
            }
            const existingUser = await this.userRepository.findOne({ where: { email } });
            if (existingUser) {
                return {
                    data: {
                        error: 'User With this email already exists',
                        status: HttpStatus.BAD_REQUEST
                    }
                }
            }
            const passwordHash = await bcrypt.hash(password, 10);
            const newUser = this.userRepository.create({ name, email, password: passwordHash, role });
            const savedUser = await this.userRepository.save(newUser);

            return {
                data: {
                    name: name.toLowerCase(),
                    email: email.toLowerCase(),
                    id: savedUser.id,
                    role: savedUser.role,
                    createdAt: savedUser.createdAt,
                    updatedAt: savedUser.updatedAt
                }
            }
        } catch (error) {
            return {
                data: {
                    error: error.message,
                    status: HttpStatus.INTERNAL_SERVER_ERROR
                }
            }
        }
    }


    async login(email: string, password: string): Promise<userResponse | errorResponse> {
        try {
            const user = await this.userRepository.findOne({ where: { email: email.toLowerCase() } });
            if (!user) {
                return {
                    data: {
                        error: 'User not found',
                        status: HttpStatus.NOT_FOUND
                    }
                }
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return {
                    data: {
                        error: 'Unauthorized',
                        status: HttpStatus.UNAUTHORIZED
                    }
                }
            }
            const jwtToken = jwt.sign({ id: user.id }, 'secret', { expiresIn: '7d' })
            return {
                data: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    token: jwtToken
                }
            }
        } catch (error) {
            console.log(error)
            return {
                data: {
                    error,
                    status: HttpStatus.INTERNAL_SERVER_ERROR
                }
            }
        }
    }

    async updateUser(id: number, email: string, name: string, password: string): Promise<userResponse | errorResponse> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            return {
                data: {
                    status: HttpStatus.NOT_FOUND,
                    error: 'User not found'
                }
            }
        }
        if (password) {
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return {
                    data: {
                        status: HttpStatus.UNAUTHORIZED,
                        error: 'Invalid Password'
                    }
                }
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        user.email = email.toLowerCase() || user.email;
        user.name = name.toLowerCase() || user.name;
        const updatedUser = await this.userRepository.save(user);
        return {
            data: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt
            }
        }
    }

    async removeUser(id: number): Promise<string | errorResponse> {
        try {
            const user = await this.userRepository.findOne({ where: { id } });
            if (!user) {
                return {
                    data: {
                        status: HttpStatus.NOT_FOUND,
                        error: 'User not found'
                    }
                }
            }
            await this.userRepository.delete({ id: user.id });
            return 'User removed successfully';
        } catch (error) {
            return {
                data: {
                    error: error.message,
                    status: HttpStatus.INTERNAL_SERVER_ERROR
                }
            }
        }
    }
}
