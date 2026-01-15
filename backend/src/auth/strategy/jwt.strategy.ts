import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Usuario } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: {
    sub: number;
    username: string;
    email: string;
    role?: string;
    idEstudiante?: number | null;
  }) {
    const user: Usuario = await this.prisma.usuario.findUnique({
      where: {
        id: payload.sub,
      },
    });

    delete user.hashedPassword;

    // ✅ Sin romper nada: devolvemos el usuario como antes,
    // pero garantizando que en req.user existan role e idEstudiante (si vienen en el token).
    return {
      ...user,
      role: (user as any).role ?? payload.role,
      idEstudiante: (user as any).idEstudiante ?? payload.idEstudiante ?? null,
    };
  }
}
