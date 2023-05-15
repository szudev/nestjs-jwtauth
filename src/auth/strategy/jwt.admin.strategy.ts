import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RolType } from '../types/roles.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('ACCESS_TOKEN_KEY'),
    });
  }

  async validate(payload: { sub: number; email: string }) {
    const { id: roleId } = await this.prisma.user_Role.findUnique({
      where: {
        name: RolType.ADMIN,
      },
    });

    if (!roleId) throw new NotFoundException();

    const user = await this.prisma.user.findFirst({
      where: {
        id: payload.sub,
        roles: {
          some: {
            user_RoleId: {
              in: roleId,
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException();
    delete user.hash;
    return user;
  }
}
