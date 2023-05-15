import { Injectable } from '@nestjs/common';
import { failureReturn, successfullReturn } from 'src/common/constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDTO } from './dto/auth.dto';
import * as argon from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Roles } from '@prisma/client';
@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private service: ConfigService,
    private jwt: JwtService,
  ) {}
  async authenticateAdmin(dto: AuthDTO) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    console.log(user);
    if (!user) {
      return failureReturn('No account found with the given email');
    }
    if (user.roles == Roles.participant) {
      return failureReturn('Admin account not found');
    }
    const pwHash = await argon.verify(user.password, dto.password);

    if (!pwHash) {
      return failureReturn('Invalid Credentials');
    }
    const token = await this.signToken(user.id, user.email);
    return successfullReturn({ token: token, role: user.roles });
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
  async getNonRegisteredUsers() {
    try {
      const response = [];
      const users = await this.prisma.user.findMany({
        where: {
          // registeredEventsId: { equals: },
        },
        select: {
          first_name: true,
          last_name: true,
          mobile: true,
          email: true,
          registeredEventsId: true,
        },
      });
      for (let i = 0; i < users.length; i++) {
        if (users[i].registeredEventsId.length === 0) {
          const payload = { ...users[i] };
          delete payload.registeredEventsId;
          response.push(payload);
        }
      }

      return successfullReturn(response, 'Users fetched successfully');
    } catch (error) {
      console.log(error);
      return failureReturn(error);
    }
  }
}
