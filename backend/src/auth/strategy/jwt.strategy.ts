import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Usuario } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET') || config.get<string>('JWT_SECRET'.toLowerCase()),
    });
  }

  async validate(payload: {
    sub: number;
    username: string;
    email: string;
    role?: string;
    idEstudiante?: number | null;
  }) {
    const user = await this.prisma.usuario.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // no romper nada: quitamos password antes de devolver
    const safeUser: any = { ...user };
    delete safeUser.hashedPassword;

    // ✅ Sin romper nada: devolvemos el usuario como antes,
    // pero garantizando que en req.user existan role e idEstudiante (si vienen en el token).
    return {
      ...safeUser,
      role: safeUser.role ?? payload.role,
      idEstudiante: safeUser.idEstudiante ?? payload.idEstudiante ?? null,
    };
  }
}
