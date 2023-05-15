import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = request?.cookies['jwt-refresh'];
          if (!data) return null;
          return data.token;
        },
      ]),
      secretOrKey: config.get('REFRESH_TOKEN_KEY'),
    });
  }

  async validate(payload: { sub: number; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });
    if (!user) throw new NotFoundException();
    delete user.hash;
    return user;
  }
}
