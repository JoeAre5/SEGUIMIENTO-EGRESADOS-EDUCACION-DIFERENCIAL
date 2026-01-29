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

    delete (userData as any).password;

    try {
      const user: Usuario = await this.prisma.usuario.create({
        data: userData as any,
      });

      delete (user as any).hashedPassword;
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credenciales duplicadas');
        }
      }
      throw error;
    }
  }

  async login(dto: UserLoginDTO) {
    const or: any[] = [];

    if (dto?.username?.trim()) {
      or.push({ username: dto.username.trim() });
    }

    if (dto?.email?.trim()) {
      or.push({ email: dto.email.trim() });
    }

    if (or.length === 0) {
      throw new ForbiddenException('Debes ingresar username o email');
    }

    const user: Usuario = await this.prisma.usuario.findFirst({
      where: { OR: or },
    });

    if (!user) throw new NotFoundException('Usuario no existe');

    if (!user.isActive) {
      throw new ForbiddenException('Usuario desactivado');
    }

    const passwordsMatch = await argon.verify(
      user.hashedPassword,
      dto.password,
    );

    if (!passwordsMatch) {
      throw new ForbiddenException('Usuario o contraseña incorrectos');
    }

    return this.signToken(
      user.id,
      user.email,
      user.username,
      user.role,
      user.idEstudiante ?? null,
    );
  }

  async signToken(
    id: number,
    email: string,
    username: string,
    role: string,
    idEstudiante: number | null,
  ) {
    const payload = {
      sub: id,
      email,
      username,
      role,
      idEstudiante,
    };

    const secret = this.configService.get<string>('JWT_SECRET');

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
      secret,
    });

    return { access_token: token };
  }
}
