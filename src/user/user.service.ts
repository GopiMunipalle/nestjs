import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import User, { Role } from './user.entity';
import { HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { userResponse } from './user.entity';
import { errorResponse } from './user.entity';
import uploadFiles from 'src/libraries/minioLib';
import { Resend } from 'resend';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async sendOtp(email: string): Promise<any> {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    try {
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: String(email),
        subject: 'Your OTP Code',
        html: `<strong>Your OTP code is: ${otp}</strong>`,
      });
      console.log(error, data);
      if (error) {
        return { code: error.name, message: error.message };
      }
      return data.id;
    } catch (error) {
      return error.message;
    }
  }

  async findAll(): Promise<userResponse[] | errorResponse> {
    try {
      const users = await this.userRepository.find();
      const formattedUsers = users.map((user) => ({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          number: user.number,
          linkedinUrl: user.linkedinUrl,
          githubUrl: user.githubUrl,
          role: user.role,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      }));
      return formattedUsers;
    } catch (error) {
      return {
        data: {
          error,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        },
      };
    }
  }

  async findOne(id: number): Promise<userResponse | errorResponse> {
    try {
      const user = await this.userRepository.findOneOrFail({ where: { id } });
      if (!user) {
        return {
          data: {
            error: 'User not found',
            status: HttpStatus.NOT_FOUND,
          },
        };
      }
      return {
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          number: user.number,
          linkedinUrl: user.linkedinUrl,
          githubUrl: user.githubUrl,
          profilePicture: user.profilePicture,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      return {
        data: {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message,
        },
      };
    }
  }

  async login(
    email: string,
    otp: string,
  ): Promise<userResponse | errorResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: email.toLowerCase() },
      });
      if (!user) {
        return {
          data: {
            error: 'User not found',
            status: HttpStatus.NOT_FOUND,
          },
        };
      }
      const isMatch = otp === user.otp;
      if (!isMatch) {
        return {
          data: {
            error: 'Invalid OTP',
            status: HttpStatus.UNAUTHORIZED,
          },
        };
      }
      const currentTime = Date.now();
      const otpExpirationTime = user.updatedAt.getTime() + 2 * 60 * 60 * 1000;
      if (currentTime > otpExpirationTime) {
        return {
          data: {
            error: 'OTP has expired',
            status: HttpStatus.UNAUTHORIZED,
          },
        };
      }
      const jwtToken = jwt.sign({ id: user.id }, 'secret', { expiresIn: '7d' });
      return {
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          number: user.number,
          linkedinUrl: user.linkedinUrl,
          githubUrl: user.githubUrl,
          profilePicture: user.profilePicture,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          token: jwtToken,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        data: {
          error,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        },
      };
    }
  }

  async registerWithEmail(
    email: string,
  ): Promise<{ data: { status: number; message: string } } | errorResponse> {
    try {
      let userDoc = await this.userRepository.findOne({ where: { email } });

      if (!userDoc) {
        userDoc = this.userRepository.create({
          email: email,
        });
        await this.userRepository.save(userDoc);
      }

      const otp = await this.sendOtp(email);
      console.log('otp', otp);
      if (otp.code) {
        return {
          data: {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: otp || 'Internal server error',
          },
        };
      }
      userDoc.otp = otp;
      await this.userRepository.save(userDoc);

      return {
        data: {
          status: HttpStatus.OK,
          message: 'OTP sent successfully',
        },
      };
    } catch (error) {
      return {
        data: {
          error: error.message || 'Internal server error',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        },
      };
    }
  }

  async updateUser(
    id: number,
    email: string,
    name: string,
    password: string,
    githubUrl: string,
    linkedinUrl: string,
    number: string,
    profilePicture: Express.Multer.File,
  ): Promise<userResponse | errorResponse> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return {
        data: {
          status: HttpStatus.NOT_FOUND,
          error: 'User not found',
        },
      };
    }
    let image = '';
    if (profilePicture) {
      // console.log(profilePicture)S
      const url = await uploadFiles([
        profilePicture,
      ] as unknown as Express.Multer.File[]);
      // image = url[0].url;
    }
    if (password) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return {
          data: {
            status: HttpStatus.UNAUTHORIZED,
            error: 'Invalid Password',
          },
        };
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    user.email = email || user.email;
    user.name = name || user.name;
    user.githubUrl = githubUrl || user.githubUrl;
    user.linkedinUrl = linkedinUrl || user.linkedinUrl;
    user.number = number || user.number;

    const updatedUser = await this.userRepository.save(user);
    return {
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        number: updatedUser.number,
        linkedinUrl: updatedUser.linkedinUrl,
        githubUrl: updatedUser.githubUrl,
        profilePicture: updatedUser.profilePicture,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    };
  }

  async removeUser(id: number): Promise<string | errorResponse> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return {
          data: {
            status: HttpStatus.NOT_FOUND,
            error: 'User not found',
          },
        };
      }
      await this.userRepository.delete({ id: user.id });
      return 'User removed successfully';
    } catch (error) {
      return {
        data: {
          error: error.message,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        },
      };
    }
  }

  async Login(
    email: string,
    otp: string,
  ): Promise<userResponse | errorResponse> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        return {
          data: {
            status: HttpStatus.NOT_FOUND,
            error: 'User not found',
          },
        };
      }
      if (user.otp !== otp) {
        return {
          data: {
            status: HttpStatus.UNAUTHORIZED,
            error: 'Invalid OTP',
          },
        };
      }
      const jwtToken = jwt.sign({ id: user.id }, 'secret', { expiresIn: '7d' });
      return {
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          number: user.number,
          linkedinUrl: user.linkedinUrl,
          githubUrl: user.githubUrl,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          token: jwtToken,
        },
      };
    } catch (error) {
      return {
        data: {
          error: error.message,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        },
      };
    }
  }
}
