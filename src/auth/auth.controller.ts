import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { GetUser } from './decorator';
import { AuthDto } from './dto';
import { JwtGuard, JwtRefreshGuard } from './guard';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private auth2Service: AuthService) {}

  @Post('signup')
  signup(@Body() dto: AuthDto): Promise<User> {
    return this.auth2Service.signup(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('/signin')
  signin(
    @Body() dto: AuthDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ token: string }> {
    return this.auth2Service.signin(dto, response);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @Post('/refresh')
  refresh(@GetUser() user: User) {
    return this.auth2Service.refresh(user);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  @Post('/logout')
  logout(@Req() request: Request, @Res() response: Response) {
    return this.auth2Service.logout(request, response);
  }

  @UseGuards(JwtGuard)
  @Post('/guardtest')
  guardTest(@GetUser() user: User) {
    return {
      idUser: user.id,
    };
  }
}
