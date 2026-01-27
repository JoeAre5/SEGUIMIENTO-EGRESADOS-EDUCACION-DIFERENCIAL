import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import {
  CreateUsuarioAdminDto,
  CreateUsuarioFromEgresadoDto,
  UpdatePasswordDto,
  UpdateRoleDto,
  UpdateUsernameDto,
} from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        username: true,
        nombreCompleto: true,
        role: true,
        idEstudiante: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  async create(dto: CreateUsuarioAdminDto) {
    if (!dto.username?.trim()) throw new BadRequestException('username requerido');
    if (!dto.email?.trim()) throw new BadRequestException('email requerido');
    if (!dto.nombreCompleto?.trim()) throw new BadRequestException('nombreCompleto requerido');

    if (dto.idEstudiante) {
      const estudiante = await this.prisma.estudiante.findUnique({
        where: { idEstudiante: dto.idEstudiante },
      });
      if (!estudiante) throw new BadRequestException('idEstudiante no existe');

      const alreadyLinked = await this.prisma.usuario.findFirst({
        where: { idEstudiante: dto.idEstudiante },
        select: { id: true },
      });
      if (alreadyLinked) throw new BadRequestException('Ese estudiante ya tiene usuario');
    }

    const hashedPassword = await argon.hash(dto.password);

    try {
      const user = await this.prisma.usuario.create({
        data: {
          username: dto.username.trim(),
          email: dto.email.trim(),
          nombreCompleto: dto.nombreCompleto.trim(),
          hashedPassword,
          role: dto.role as any,
          idEstudiante: dto.idEstudiante ?? null,
          // isActive default true (Prisma)
        },
      });

      const { hashedPassword: _, ...safe } = user as any;
      return safe;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Datos duplicados (username o email ya existen)');
      }
      throw error;
    }
  }

  async createFromEgresado(idEgresado: number, dto: CreateUsuarioFromEgresadoDto) {
  const egresado = await this.prisma.egresado.findUnique({
    where: { idEgresado },
    select: { idEgresado: true, idEstudiante: true },
  });

  if (!egresado) throw new NotFoundException('Egresado no encontrado');
  if (!egresado.idEstudiante) throw new BadRequestException('Egresado sin estudiante asociado');

  const alreadyLinked = await this.prisma.usuario.findFirst({
    where: { idEstudiante: egresado.idEstudiante },
    select: { id: true },
  });
  if (alreadyLinked) throw new BadRequestException('Ese egresado ya tiene usuario');

  const estudiante = await this.prisma.estudiante.findUnique({
    where: { idEstudiante: egresado.idEstudiante },
    select: { idEstudiante: true },
  });
  if (!estudiante) throw new BadRequestException('El estudiante asociado no existe');

  if (!dto.username?.trim()) throw new BadRequestException('username requerido');
  if (!dto.nombreCompleto?.trim()) throw new BadRequestException('nombreCompleto requerido');
  if (!dto.password?.trim()) throw new BadRequestException('password requerido');

  const hashedPassword = await argon.hash(dto.password);

  // ✅ email opcional: NO se manda si está vacío
  const email = dto.email?.trim();

  const data: any = {
    username: dto.username.trim(),
    nombreCompleto: dto.nombreCompleto.trim(),
    hashedPassword,
    role: ((dto.role ?? 'EGRESADO') as any),
    idEstudiante: egresado.idEstudiante,
  };

  if (email && email.length > 0) data.email = email;

  try {
    const user = await this.prisma.usuario.create({ data });

    const { hashedPassword: _, ...safe } = user as any;
    return safe;
  } catch (error: any) {
    // ✅ Si hay unique constraint (username/email/idEstudiante), lo devolvemos como 400 con mensaje
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      const target = (error.meta as any)?.target?.join?.(', ') ?? 'campo único';
      throw new BadRequestException(`Datos duplicados (${target})`);
    }
    throw error;
  }
}


  async updateUsername(id: number, dto: UpdateUsernameDto) {
    if (!dto.username?.trim()) throw new BadRequestException('username requerido');

    const exists = await this.prisma.usuario.findUnique({
      where: { username: dto.username.trim() },
      select: { id: true },
    });
    if (exists && exists.id !== id) throw new BadRequestException('username ya existe');

    const user = await this.prisma.usuario.update({
      where: { id },
      data: { username: dto.username.trim() },
    });

    const { hashedPassword: _, ...safe } = user as any;
    return safe;
  }

  async updatePassword(id: number, dto: UpdatePasswordDto) {
    const hashedPassword = await argon.hash(dto.password);

    const user = await this.prisma.usuario.update({
      where: { id },
      data: { hashedPassword },
    });

    const { hashedPassword: _, ...safe } = user as any;
    return safe;
  }

  async updateRole(id: number, dto: UpdateRoleDto, actorId?: number) {
    // Regla opcional para evitar auto-degradarse (no afecta a otros roles)
    if (actorId && id === actorId && dto.role !== 'Administrador') {
      throw new ForbiddenException('No puedes quitarte el rol Administrador a ti mismo');
    }

    const user = await this.prisma.usuario.update({
      where: { id },
      data: { role: dto.role as any },
    });

    const { hashedPassword: _, ...safe } = user as any;
    return safe;
  }

  async setActive(id: number, isActive: boolean) {
    const user = await this.prisma.usuario.update({
      where: { id },
      data: { isActive },
    });

    const { hashedPassword: _, ...safe } = user as any;
    return safe;
  }

  async egresadosSinCuenta() {
  const usersLinked = await this.prisma.usuario.findMany({
    where: { idEstudiante: { not: null } },
    select: { idEstudiante: true },
  });

  const linkedIds = usersLinked
    .map((u) => u.idEstudiante)
    .filter((x): x is number => typeof x === 'number');

  return this.prisma.egresado.findMany({
    where: linkedIds.length ? { idEstudiante: { notIn: linkedIds } } : {},
    select: {
      idEgresado: true,
      idEstudiante: true,
      Estudiante: { select: { rut: true, nombreCompleto: true } },
    } as any,
    orderBy: { idEgresado: 'desc' },
  });
}

}
