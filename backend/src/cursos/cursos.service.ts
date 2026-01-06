import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cursacion } from '@prisma/client';

@Injectable()
export class CursosService {
  constructor(private prisma: PrismaService) {}

  //proximamente desaparecerá...
  async getCursosDeAsignatura(idAsig: number) {
    return await this.prisma.cursacion.findMany({
      where: {
        idAsignatura: idAsig,
      },
    });
  }

  async getCursacionesPorIdAsignatura(
    idPlan: number,
    idAsignatura: number,
  ): Promise<Cursacion[]> {
    return await this.prisma.cursacion.findMany({
      where: { idPlan: idPlan, idAsignatura: idAsignatura },
    });
  }

  async getCursacionesPorCodigoDeAsignatura(
    idPlan: number,
    codigoAsignatura: string,
  ): Promise<Cursacion[]> {
    return await this.prisma.cursacion.findMany({
      where: {
        idPlan: idPlan,
        AND: {
          Asignatura: {
            codigo: codigoAsignatura,
          },
        },
      },
    });
  }
}
