import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto, RegisterDto } from 'src/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async login(dto: AuthDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
      },
    });
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
      message: 'Logged in succesfully',
    };
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
}
