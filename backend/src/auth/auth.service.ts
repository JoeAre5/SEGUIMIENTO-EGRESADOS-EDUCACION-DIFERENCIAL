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
    // ✅ FIX seguro: construir OR solo con valores presentes
    // Evita que Prisma reciba filtros vacíos cuando username/email vienen undefined
    const or: any[] = [];

    if (dto?.username && dto.username.trim()) {
      or.push({ username: dto.username.trim() });
    }

    if (dto?.email && dto.email.trim()) {
      or.push({ email: dto.email.trim() });
    }

    if (or.length === 0) {
      // Mantiene comportamiento lógico sin romper: si no llega nada para buscar, no hay login
      throw new ForbiddenException('Debes ingresar username o email');
    }

    const user: Usuario = await this.prisma.usuario.findFirst({
      where: { OR: or },
    });

    if (!user) throw new NotFoundException('Usuario no existe');

    const passwordsMatch = await argon.verify(
      (user as any).hashedPassword,
      dto.password,
    );

    if (!passwordsMatch)
      throw new ForbiddenException('Usuario o Contraseña incorrectos');

    // ✅ Incluye idEstudiante si existe en el modelo (si no, queda null sin romper)
    const idEstudiante =
      (user as unknown as { idEstudiante?: number | null }).idEstudiante ?? null;

    return this.signToken(
      (user as any).id,
      (user as any).email,
      (user as any).username,
      (user as any).role,
      idEstudiante,
    );
  }

  async signToken(
    id: number,
    email: string,
    username: string,
    role: string,
    idEstudiante: number | null = null,
  ) {
    const payload = {
      sub: id,
      username,
      email,
      role,
      // ✅ Esto permite que el frontend y/o backend hagan "mine" usando idEstudiante
      idEstudiante,
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
