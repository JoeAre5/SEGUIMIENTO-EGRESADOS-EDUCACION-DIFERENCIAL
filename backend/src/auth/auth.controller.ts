import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserLoginDTO, UserRegisterDTO } from './dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: UserLoginDTO) {
    return this.authService.login(dto);
  }

  /**
   * ⚠️ Más adelante este endpoint lo dejaremos SOLO para ADMIN
   */
  @Post('register')
  register(@Body() dto: UserRegisterDTO) {
    return this.authService.register(dto);
  }

  /**
   * ✅ Endpoint clave para frontend
   * Devuelve el usuario autenticado + role + idEstudiante
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Req() req: any) {
    return req.user;
  }
}
