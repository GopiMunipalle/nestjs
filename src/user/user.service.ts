import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from './user.entity';
import { HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { userResponse } from './user.entity';
import { errorResponse } from './user.entity';
import * as nodemailer from 'nodemailer';

@Injectable()
export class UserService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async sendOtp(
    email: string,
  ): Promise<{ code: string; message: string; status: number }> {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: String(email),
        subject: 'Your OTP Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
            <div style="background-color: #4285f4; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Verification Code</h1>
            </div>
            <div style="padding: 20px; text-align: center;">
              <p style="font-size: 16px; color: #333; margin-bottom: 30px;">Please use the following OTP code to complete your verification:</p>
              <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; font-size: 28px; letter-spacing: 5px; font-weight: bold; color: #333; margin-bottom: 30px;">
                ${otp}
              </div>
              <p style="font-size: 14px; color: #777;">This code will expire in 5 minutes.</p>
              <p style="font-size: 14px; color: #777;">If you didn't request this code, please ignore this email.</p>
            </div>
            <div style="border-top: 1px solid #e1e1e1; padding-top: 20px; font-size: 12px; color: #777; text-align: center;">
              <p>© ${new Date().getFullYear()} resumeeasy. All rights reserved.</p>
            </div>
          </div>
        `,
      });

      console.log('Message ID:', info.messageId);

      return {
        code: otp,
        message: 'Email sent successfully',
        status: 200,
      };
    } catch (error) {
      return {
        code: null,
        message: 'Error sending email',
        status: 500,
      };
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
      const user = await this.userRepository.findOne({ where: { id } });
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
      const normalizedEmail = email.toLowerCase();
      const user = await this.userRepository.findOne({
        where: { email: normalizedEmail },
      });
      if (!user) {
        return {
          data: {
            error: 'User  not found',
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
      const currentTime = new Date().getTime();
      const otpExpirationTime = user.otpSentAt.getTime() + 5 * 60 * 1000;
      if (Number(otpExpirationTime) <= Number(currentTime)) {
        return {
          data: {
            error: 'OTP has expired',
            status: HttpStatus.UNAUTHORIZED,
          },
        };
      }

      const jwtToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
        expiresIn: '1d',
      });
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
      return {
        data: {
          error: 'Internal server error',
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        },
      };
    }
  }

  async registerWithEmail(
    email: string,
  ): Promise<{ data: any } | errorResponse> {
    try {
      const { code, message, status } = await this.sendOtp(email);
      if (status !== 200) {
        return {
          data: {
            status: status,
            message: message,
          },
        };
      }

      let userDoc = await this.userRepository.findOne({ where: { email } });

      if (!userDoc) {
        userDoc = this.userRepository.create({
          email: email,
          otp: code,
          otpSentAt: new Date(),
        });
        await this.userRepository.save(userDoc);
      } else {
        if (userDoc.isVerified) {
          const jwtToken = jwt.sign(
            { id: userDoc.id },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: '1d',
            },
          );
          return {
            data: {
              id: userDoc?.id,
              email: userDoc?.email,
              name: userDoc?.name,
              number: userDoc?.number,
              linkedinUrl: userDoc?.linkedinUrl,
              githubUrl: userDoc?.githubUrl,
              role: userDoc?.role,
              createdAt: userDoc?.createdAt,
              updatedAt: userDoc?.updatedAt,
              token: jwtToken,
            },
          };
        }
        userDoc.otp = code;
        userDoc.otpSentAt = new Date();
        await this.userRepository.save(userDoc);
      }

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
    githubUrl: string,
    linkedinUrl: string,
    number: string,
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

  async removeUser(id: number): Promise<any | errorResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['resumes'],
      });
      if (!user) {
        return {
          data: {
            status: HttpStatus.NOT_FOUND,
            error: 'User not found',
          },
        };
      }

      await this.userRepository.remove(user);

      return {
        data: {
          status: HttpStatus.OK,
          message: 'User deleted successfully',
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
