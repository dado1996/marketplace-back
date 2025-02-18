import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AuthDto, RegisterDto } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: AuthDto) {
    try {
      // Find the email in the table
      const user = await this.prisma.user.findFirst({
        where: {
          email: dto.email,
        },
      });
      // If the user does not exist throw exception
      if (!user) {
        throw new ForbiddenException('Credentials incorrect');
      }

      const { password, ...userDissect } = user;

      const pwMatches = await argon.verify(password, dto.password);
      if (!pwMatches) {
        throw new ForbiddenException('Credentials incorrect');
      }

      return {
        status: 200,
        data: userDissect,
        token: await this.signToken(
          userDissect.id,
          userDissect.email,
          userDissect.type,
        ),
        message: 'Logged in succesfully',
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new HttpException(
            'Internal Error',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
      }
      throw error;
    }
  }

  async register(dto: RegisterDto) {
    // Checks that the passwords matches
    if (dto.password !== dto.confirmPassword) {
      return {
        status: 400,
        message: "Passwords don't match",
      };
    }

    try {
      // Hashes the password
      const hash = await argon.hash(dto.password);
      // Creates the user
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
          type: dto.type,
        },
        select: {
          email: true,
          type: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        },
      });
      return {
        status: 200,
        message: 'Register success',
        data: user,
      };
    } catch (error) {
      // If the user tries to create an account with an
      // existing email, it throws the error
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  signToken(userId: number, email: string, type: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
      type,
    };

    return this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET'),
    });
  }
}
