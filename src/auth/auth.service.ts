import { Injectable } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto';
import { SignUpDTO } from './dto/signup.dto';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { failureReturn, successfullReturn } from 'src/common/constants';
import { MailService } from 'src/mail/mail.service';
import {
  CheckEmailDTO,
  OtpDTO,
  ResetPasswordDTO,
  VerifyDTO,
  VerifyEmailMobileDTO,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private service: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async signUp(dto: SignUpDTO) {
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          first_name: dto.first_name,
          last_name: dto.last_name,
          college: dto.college,
          email: dto.email,
          password: hash,
          mobile: dto.mobile,
          branch: dto.branch,
          year: dto.year,
        },
      });
      const response = successfullReturn(
        await this.signToken(user.id, user.email),
      );
      this.mailService.sendEmail(
        dto.email,
        'Account SignUp Successful',
        'Welcome to Praxis! You have successfully signed up for IEEEPCCOE Praxis',
      );
      return response;
    } catch (error) {
      console.log(error);
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return failureReturn('Credentials Taken');
        }
        return failureReturn('Enter Correct Details');
      }
      return failureReturn('Enter Correct Details');
    }
  }

  async verifySignup(dto: VerifyEmailMobileDTO) {
    const user1 = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // const user2 = await this.prisma.user.findUnique({
    //   where: {
    //     mobile: parseInt(dto.mobile.toString()),
    //   },
    // });

    if (user1) {
      return failureReturn(
        'Email is already registered! Please login to continue',
      );
    } else {
      return successfullReturn(null, 'Email and Mobile Number are unique');
    }
  }
  //LOGIN
  async login(dto: LoginDTO) {
    let user;
    if (dto.email) {
      user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });
      console.log(user);
    } else {
      return failureReturn('Please enter correct email');
    }
    if (!user) {
      return failureReturn('Invalid Credentials');
    }
    const pwHash = await argon.verify(user.password, dto.password);

    if (!pwHash) {
      return failureReturn('Invalid Credentials');
    }
    const token = await this.signToken(user.id, user.email);
    return successfullReturn(token);
  }

  async checkValidEmail(dto: CheckEmailDTO) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      return failureReturn('Account does not exist with given email');
    } else {
      return successfullReturn(null, null);
    }
  }

  async generateTokenAndSendEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return failureReturn('Email not found');
    }
    const resetToken = await this.jwt.sign(
      { userId: user.id },
      {
        secret: this.service.get('JWT_SECRET'),
        expiresIn: '15m',
      },
    );

    this.mailService.sendEmailVerificationLink(user.email, resetToken);
    return successfullReturn(null, 'Email sent successfully');
  }

  async resetPassword(dto: ResetPasswordDTO) {
    try {
      const hash = await argon.hash(dto.password);
      const response = await this.prisma.user.update({
        where: {
          email: dto.email,
        },
        data: {
          password: hash,
        },
      });
      if (response) {
        this.mailService.sendEmail(
          dto.email,
          'Password Reset',
          'Password change for your PCCOEIEEE Account was detected. If not done by you, contact our team Immedietely.',
        );

        return successfullReturn(null, 'Password changed successfully');
      } else
        return failureReturn('Something went wrong! Please try again later');
    } catch (err) {
      return failureReturn(err);
    }
  }

  async sendOtp(dto: OtpDTO) {
    const otp = Math.floor(1000 + Math.random() * 900000);
    return this.mailService.sendOTP(dto.email, otp);
  }
  async verifyOtp(dto: VerifyDTO) {
    try {
      if (dto.received_otp === dto.sent_otp) {
        return successfullReturn(null, dto.email.toString() + ' is verified!');
      } else {
        return failureReturn('Invalid OTP!');
      }
    } catch (err) {
      return failureReturn(err);
    }
  }
  async signToken(
    id: string,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = { id, email };
    const secret = this.service.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '10d',
      secret: secret,
    });
    return {
      access_token: token,
    };
  }
}
