import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserLoginDTO, UserRegisterDTO } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { Usuario } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async register(dto: UserRegisterDTO) {
    const userData = {
      ...dto,
      hashedPassword: await argon.hash(dto.password),
    };

    delete userData.password;

    try {
      const user: Usuario = await this.prisma.usuario.create({
        data: userData,
      });
      delete user.hashedPassword;
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credenciales duplicadas');
        }
      } else {
        throw error;
      }
    }
  }

  async login(dto: UserLoginDTO) {
    const user: Usuario = await this.prisma.usuario.findFirst({
      where: {
        OR: [{ username: dto.username }, { email: dto.email }],
      },
    });

    if (!user) throw new NotFoundException('Usuario no existe');

    const passwordsMatch = await argon.verify(
      user.hashedPassword,
      dto.password,
    );

    if (!passwordsMatch)
      throw new ForbiddenException('Usuario o Contraseña incorrectos');

    return this.signToken(user.id, user.email, user.username, user.role);
  }

  async signToken(id: number, email: string, username: string, role: string) {
    const payload = {
      sub: id,
      username,
      email,
      role,
    };

    const secret = this.configService.get('JWT_SECRET');

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }
}
