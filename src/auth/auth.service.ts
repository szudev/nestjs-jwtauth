import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Request, Response } from 'express';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { RolType } from './types/roles.type';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signToken(
    userId: number,
    email: string,
    tokenType: 'access' | 'refresh',
  ): Promise<{ token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const secret =
      tokenType === 'access'
        ? this.config.get('ACCESS_TOKEN_KEY')
        : this.config.get('REFRESH_TOKEN_KEY');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: tokenType === 'access' ? '1m' : '1d',
      secret: secret,
    });

    return {
      token,
    };
  }

  async signup(dto: AuthDto): Promise<User> {
    const hashedPassword = await argon.hash(dto.password);

    try {
      const { id: userRoleId } = await this.prisma.user_Role.findUnique({
        where: {
          name: RolType.USER,
        },
      });

      const newUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: hashedPassword,
          roles: {
            create: [
              {
                User_Role: {
                  connect: {
                    id: userRoleId,
                  },
                },
              },
            ],
          },
        },
      });

      delete newUser.hash;
      return newUser;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ForbiddenException('Credentials taken.');
      }

      throw error;
    }
  }

  async signin(dto: AuthDto, response: Response): Promise<{ token: string }> {
    const foundUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!foundUser) throw new ForbiddenException('Credentials incorrect.');

    const pwMatches = await argon.verify(foundUser.hash, dto.password);

    if (!pwMatches) throw new ForbiddenException('Credentials incorrect.');

    const accessToken = await this.signToken(
      foundUser.id,
      foundUser.email,
      'access',
    );

    const refreshToken = await this.signToken(
      foundUser.id,
      foundUser.email,
      'refresh',
    );

    response.cookie('jwt-refresh', refreshToken, {
      httpOnly: true, //unicamente accesible mediante web server
      secure: true, //https
      sameSite: 'none', //cross-site cookie
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return accessToken;
  }

  async refresh(user: User) {
    const accessToken = await this.signToken(user.id, user.email, 'access');
    return accessToken;
  }

  logout(request: Request, response: Response) {
    const cookie = request.cookies['jwt-refresh'];
    if (!cookie) return response.sendStatus(204);
    response.clearCookie('jwt-refresh', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    return response.json({ message: 'Disconnected.' });
  }
}
