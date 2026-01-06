import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LineaAsignatura } from '@prisma/client';
import { lineaAsignaturasGetAsignaturasPorIdLinea } from '@prisma/client/sql';
import {
  GetLineaAsignaturaDTO,
  ListarLineasAsignaturaDTO,
  AsignaturaDeLinea,
  LineaConAsignaturas,
  ActualizarDatosLineaDTO,
  UpdateLineaDTO,
  CrearLineaDTO,
} from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class LineaAsignaturaService {
  constructor(private prisma: PrismaService) {}

  private SIN_LINEA: string = 'SIN LINEA';

  async getAllLineasAsignatura(): Promise<LineaAsignatura[]> {
    return this.prisma.lineaAsignatura.findMany();
  }

  // BLOQUE DE OBTENER LINEAS DE ASIGNATURA POR PLAN

  private async getLineasPorPlan(
    idPlan: number,
  ): Promise<GetLineaAsignaturaDTO[]> {
    const lineasResultado = await this.prisma.lineaAsignatura.findMany({
      where: {
        idPlan: idPlan,
      },
      select: {
        idLinea: true,
        titulo: true,
        color: true,
      },
    });

    return lineasResultado as GetLineaAsignaturaDTO[];
  }

  /*
   * Método Principal del bloque
   *
   * Trae todas las lineas asociadas a un plan de estudios usando
   * ListarLineasAsignaturaDTO
   * {
   *   idPlan,
   *   tituloPlan,
   *   lineasAsignatura: [
   *     {idLinea, titulo},
   *     {idLinea, titulo}....
   *   ]
   * }
   * */
  async getAllLineasAsignaturasDePlan(idPlan: number) {
    const resultadoTituloPlan = await this.prisma.plan.findUnique({
      where: { idPlan: idPlan },
      select: { titulo: true },
    });

    if (!resultadoTituloPlan)
      throw new NotFoundException('El plan solicitado no existe');

    const lineas: GetLineaAsignaturaDTO[] = await this.getLineasPorPlan(idPlan);

    return {
      idPlan: idPlan,
      tituloPlan: resultadoTituloPlan.titulo,
      lineasAsignatura: lineas,
    } as ListarLineasAsignaturaDTO;
  }

  //BLOQUE DE LISTAR ASIGNATURAS POR LINEA

  private async getLineaAsignaturaConAsignaturas(
    idPlan: number,
  ): Promise<AsignaturaDeLinea[]> {
    const asignaturasDeLinea = await this.prisma.$queryRawTyped(
      lineaAsignaturasGetAsignaturasPorIdLinea(idPlan),
    );

    return asignaturasDeLinea
      .map((value) => {
        return {
          titulo: value.titulo ?? this.SIN_LINEA,
          posicion: value.posicion,
          codigo: value.codigo,
          nombre: value.nombre,
          areaFormacion: value.areaFormacion,
          idAsignatura: value.idAsignatura,
        };
      })
      .sort((a, b) => a.posicion - b.posicion);
  }

  /*
   * Método Principal del Bloque
   *
   * Retorna un listado de LineaConAsignatura, donde se muestra por cada DTO:
   * {
   *  titulo: string,
   *  asignaturas: AsignaturaDeLinea[]
   * }
   *
   * y AsingaturaDeLinea:
   * {
   *  codigo: string,
   *  nombre: string,
   *  areaFormacion: string
   * }
   * */
  async getLineasConAsignaturasDePlan(
    idPlan: number,
  ): Promise<LineaConAsignaturas> {
    const hashMapLineaConAsignatura: Record<string, AsignaturaDeLinea[]> = {};

    const resultadoPorLinea: AsignaturaDeLinea[] =
      await this.getLineaAsignaturaConAsignaturas(idPlan);

    resultadoPorLinea.forEach((asignatura) => {
      if (!hashMapLineaConAsignatura[asignatura.titulo]) {
        hashMapLineaConAsignatura[asignatura.titulo] = [];
      }
      hashMapLineaConAsignatura[asignatura.titulo].push(asignatura);
    });

    return hashMapLineaConAsignatura as LineaConAsignaturas;
  }

  async findOne(idPlan: number, idLinea: number) {
    const lineaEncontrada = await this.prisma.lineaAsignatura.findUnique({
      where: {
        idPlan_idLinea: {
          idPlan,
          idLinea,
        },
      },
    });

    return lineaEncontrada;
  }

  async crearLinea(idPlan: number, data: CrearLineaDTO) {
    try {
      const lineaCreada = await this.prisma.lineaAsignatura.create({
        data: {
          titulo: data.tituloLineaNuevo,
          color: data.tituloLineaNuevo,
          idPlan: idPlan,
        },
      });

      return lineaCreada;
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

  async borrarLinea(idPlan: number, idLinea: number) {
    try {
      const asignaturasDesligadas = await this.prisma.asignatura.updateMany({
        where: {
          LineaContemplaAsignatura: {
            idPlan,
            idLinea,
          },
        },
        data: {
          idLinea: null,
        },
      });

      const lineaBorrada = await this.prisma.lineaAsignatura.delete({
        where: {
          idPlan_idLinea: {
            idPlan,
            idLinea,
          },
        },
      });

      return {
        asignaturasDesligadas,
        lineaBorrada,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('La línea proporcionada no existe');
        }
      } else {
        throw error;
      }
    }
  }

  async actualizarLinea(idPlan: number, idLinea: number, data: UpdateLineaDTO) {
    try {
      const lineaActualizada = await this.prisma.lineaAsignatura.update({
        where: {
          idPlan_idLinea: {
            idPlan,
            idLinea,
          },
        },
        data: data,
      });

      return lineaActualizada;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw new NotFoundException('La línea no existe');
        }
      }
    }
  }

  /**
   * Permite actualizar las líneas de asignaturas del plan especificado en lotes.
   *
   * Se debe especificar la línea a la cual agregar las asignaturas y luego los códigos
   * en un arreglo.
   *
   * Se puede especificar tanto un nombre nuevo como un color para modificar la línea.
   * */
  async updateDatosLineaPorPlan(idPlan: number, data: ActualizarDatosLineaDTO) {
    const lineasExistentes: string[] = await this.prisma.lineaAsignatura
      .findMany({
        where: { idPlan },
        select: { titulo: true },
      })
      .then((v) => v.flatMap((v) => v.titulo));

    const lineasDatosNuevos = data.lineasNuevas.map((l) => {
      return {
        titulo: l.tituloLineaRelacionada ?? '',
        tituloNuevo: l.tituloNuevo,
        color: l.colorNuevo,
        idPlan,
      };
    });

    const lineasNuevas = lineasDatosNuevos.filter((l) => {
      if (!lineasExistentes.includes(l.titulo) || l.tituloNuevo) return l;
    });

    const lineasNuevasInsertadas = await this.prisma.lineaAsignatura.createMany(
      {
        data: lineasNuevas
          .filter((l) => l.titulo)
          .map((l) => {
            return {
              titulo: l.titulo,
              color: l.color,
              idPlan: l.idPlan,
            } as LineaAsignatura;
          }),
      },
    );

    const lineasUpdateQueries = [];

    for (const lineaNueva of data.lineasNuevas) {
      for (const codigo of lineaNueva.codigosAsignaturas) {
        if (!lineaNueva.tituloLineaRelacionada) {
          lineasUpdateQueries.push(
            this.prisma.asignatura.update({
              where: {
                codigoPorPlanUnico: {
                  idPlan,
                  codigo,
                },
              },
              data: {
                idLinea: null,
              },
            }),
          );
        } else {
          lineasUpdateQueries.push(
            this.prisma.asignatura.update({
              where: {
                codigoPorPlanUnico: {
                  idPlan,
                  codigo,
                },
              },
              data: {
                LineaContemplaAsignatura: {
                  connectOrCreate: {
                    where: {
                      tituloUnicoPorPlan: {
                        idPlan,
                        titulo: lineaNueva.tituloLineaRelacionada,
                      },
                    },
                    create: {
                      idPlan,
                      titulo: lineaNueva.tituloLineaRelacionada,
                      color: lineaNueva.colorNuevo,
                    },
                  },
                  update: {
                    color: lineaNueva.colorNuevo,
                    titulo: lineaNueva.tituloNuevo,
                  },
                },
              },
              include: {
                LineaContemplaAsignatura: {
                  select: {
                    titulo: true,
                    color: true,
                  },
                },
              },
            }),
          );
        }
      }
    }

    try {
      const result = await Promise.all(lineasUpdateQueries);

      return {
        lineasNuevasInsertadas,
        updateResult: result,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025':
            throw new NotFoundException(
              'Uno de los códigos proporcionados no corresponde a ningún plan o asignatura almacenados',
            );
        }
      }
    }
  }
}
