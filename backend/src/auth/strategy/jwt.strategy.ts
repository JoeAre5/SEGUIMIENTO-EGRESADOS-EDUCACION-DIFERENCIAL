import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService
  ) {

    const secret =
      config.get<string>('JWT_SECRET') ||
      config.get<string>('jwt_secret') ||
      config.get<string>('JWT_SECRET'.toLowerCase());

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
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
      where: { id: payload.sub },
    });

    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const safeUser: any = { ...user };
    delete safeUser.hashedPassword;

    return {
      ...safeUser,
      role: safeUser.role ?? payload.role,
      idEstudiante: safeUser.idEstudiante ?? payload.idEstudiante ?? null,
    };
  }
}
