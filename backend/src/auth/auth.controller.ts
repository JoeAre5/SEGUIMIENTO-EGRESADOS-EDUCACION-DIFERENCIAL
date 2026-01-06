import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserLoginDTO, UserRegisterDTO } from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: UserLoginDTO) {
    return this.authService.login(dto);
  }

  @Post('register')
  register(@Body() dto: UserRegisterDTO) {
    return this.authService.register(dto);
  }
}
