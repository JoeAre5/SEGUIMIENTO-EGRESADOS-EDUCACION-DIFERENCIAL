import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEgresadoDto } from './dto/create-egresado.dto';
import { UpdateEgresadoDto } from './dto/update-egresado.dto';

@Injectable()
export class EgresadosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEgresadoDto) {
  const existe = await this.prisma.egresado.findUnique({
    where: { idEstudiante: dto.idEstudiante },
  });

  if (existe) {
    // Si ya existe, actualizamos
    return this.prisma.egresado.update({
      where: { idEgresado: existe.idEgresado },
      data: {
        ...dto,
        fechaEgreso: new Date(dto.fechaEgreso),
      },
    });
  }

  // Si no existe, creamos nuevo
  return this.prisma.egresado.create({
    data: {
      ...dto,
      fechaEgreso: new Date(dto.fechaEgreso),
    },
  });
}


  async findAll() {
    return this.prisma.egresado.findMany({
      include: {
        documentos: true,
        Estudiante: true,
      },
    });
  }

  async findOne(idEgresado: number) {
    const egresado = await this.prisma.egresado.findUnique({
      where: { idEgresado },
      include: {
        documentos: true,
        Estudiante: true,
      },
    });

    if (!egresado) throw new NotFoundException('Egresado no encontrado');
    return egresado;
  }

  async update(idEgresado: number, dto: UpdateEgresadoDto) {
    return this.prisma.egresado.update({
      where: { idEgresado },
      data: {
        ...dto,
        fechaEgreso: dto.fechaEgreso ? new Date(dto.fechaEgreso) : undefined,
      },
    });
  }

  async remove(idEgresado: number) {
    return this.prisma.egresado.delete({
      where: { idEgresado },
    });
  }
}
