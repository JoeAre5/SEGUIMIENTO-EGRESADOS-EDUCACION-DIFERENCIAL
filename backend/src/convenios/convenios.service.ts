import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Convenio, Modalidad } from '@prisma/client';
import { DetalleConvenioDTO } from './dto/detalles.dto';
import {
  conveniosGetAprobacion,
  conveniosGetPromedio,
  conveniosListar,
} from '@prisma/client/sql';
import { ListarConvenioDTO } from '../practicas/dto/listar.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UpdateConvenioDTO, CreateConvenioDTO } from './dto';
import * as fs from 'fs';

@Injectable()
export class ConveniosService {
  constructor(private prisma: PrismaService) {}

  async getAllConvenios(): Promise<Convenio[]> {
    return this.prisma.convenio.findMany();
  }

  //BLOQUE detalle de convenio

  /**
   * Retorna el convenio y su modalidad con el identificador especificado
   * @param idConvenio Id del convenio
   * @returns {Convenio} El convenio y su modalidad con la id especificada
   */
  private async getConvenioPorId(idConvenio: number): Promise<Convenio> {
    return await this.prisma.convenio.findUnique({
      where: { idConvenio: idConvenio },
      include: {
        Modalidad: {
          select: { nombreModalidad: true },
        },
      },
    });
  }

  /**
   * Cuenta el total de prácticas tomadas por convenio almacenado
   * @param idConvenio Id del convenio
   * @returns {number} Número de prácticas tomadas por convenio
   */
  private async getTotalDePracticasEnConvenio(
    idConvenio: number,
  ): Promise<number> {
    const count = await this.prisma.practicaTomada.count({
      where: {
        PTConvenios: {
          some: {
            idConvenio: idConvenio,
          },
        },
      },
    });

    return count ?? 0;
  }

  /**
   * Retorna el promedio de las prácticas tomadas de un convenio
   * @param idConvenio Id del convenio
   * @returns {number} Promedio de las prácticas tomadas por convenio
   */
  private async getPromedioDePracticas(idConvenio: number): Promise<number> {
    const response = await this.prisma.$queryRawTyped(
      conveniosGetPromedio(idConvenio),
    );

    return response[0]?.promedioPracticas ?? 0;
  }

  /**
   * Retorna el porcentaje de aprobación de las prácticas tomadas de un convenio
   * @param idConvenio Id del convenio
   * @returns {number} Porcentaje de aprobación de las prácticas tomadas por convenio
   */
  private async getAprobacionDePracticas(idConvenio: number): Promise<number> {
    const response = await this.prisma.$queryRawTyped(
      conveniosGetAprobacion(idConvenio),
    );

    return response[0]?.porcentajeAprobacion.toNumber() ?? 0;
  }

  /*
    Retorna el detalle completo de un convenio pasándole su idConvenio
    *@return-type DetalleConvenioDTO
    EJ
    {
      convenio: {....},
      nroPracticasRealizadas: 45,
      promedioPracticas: 6.4,
      porcentajeAprobacion: 85,
      porcentajeReprobacion: 15
    }
     */

  /**
   * Retorna el detalle completo de un convenio pasándole su idConvenio
   * EJ:
   * {
   *   convenio: {....},
   *   nroPracticasRealizadas: 45,
   *   promedioPracticas: 6.4,
   *   porcentajeAprobacion: 85,
   *    porcentajeReprobacion: 15
   * }
   * @param idConvenio Id del convenio
   * @returns {Promise<DetalleConvenioDTO>}
   */
  async getDetalleConvenioCompleto(
    idConvenio: number,
  ): Promise<DetalleConvenioDTO> {
    const [
      infoConvenio,
      infoPracticasRealizadas,
      infoPromedio,
      infoAprobacion,
    ] = await Promise.all([
      this.getConvenioPorId(idConvenio),
      this.getTotalDePracticasEnConvenio(idConvenio),
      this.getPromedioDePracticas(idConvenio),
      this.getAprobacionDePracticas(idConvenio),
    ]);
    return {
      convenio: infoConvenio,
      nroPracticasRealizadas: infoPracticasRealizadas,
      promedioPracticas: infoPromedio,
      porcentajeAprobacion: infoAprobacion,
      porcentajeReprobacion: 100 - infoAprobacion,
    } as DetalleConvenioDTO;
  }
  // FIN bloque detalles de convenio

  // Bloque CRUD de Convenios

  //TODO
  //Usado para "eliminar" un convenio haciendo false su validez
  async invalidarConvenio(idConvenio: number) {
    return await this.prisma.convenio.update({
      where: {
        idConvenio: idConvenio,
      },
      data: {
        validez: false,
      },
    });
  }

  // TODO
  //Usado para actualizar la información de un convenio
  async updateConvenio(
    idConvenio: number,
    update: UpdateConvenioDTO,
    urlFoto: string,
    documentoConvenio: string,
  ) {
    const pathsArchivos: string[] = [urlFoto, documentoConvenio];
    try {
      //usa == en lugar de === porque no sé si viene como string o numero
      const datosModalidad =
        update.idModalidad == 0
          ? { create: { nombreModalidad: update.nombreModalidad } }
          : { connect: { idModalidad: update.idModalidad } };

      return await this.prisma.convenio.update({
        where: { idConvenio },
        data: {
          titulo: update.titulo,
          centroPractica: update.centroPractica,
          fechaInicioConvenio: update.fechaInicioConvenio,
          fechaFinConvenio: update.fechaFinConvenio,
          documentoConvenio: documentoConvenio ?? update.documentoConvenio,
          urlFoto: urlFoto ?? update.urlFoto,
          Modalidad: datosModalidad,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.error(error);
        //en caso de ocurrir errores con el update, se borran los paths del interceptor
        try {
          //console.log(pathsArchivos);
          pathsArchivos.forEach((path) => {
            if (fs.existsSync(path)) {
              fs.unlinkSync(path);
            }
          });
        } catch (unlinkError) {
          console.error(`Error al eliminar el archivo`, unlinkError);
        }
        throw new BadRequestException('Error en los datos de la query');
      } else {
        throw error;
      }
    }
  }

  /**
   * Usado para crear un convenio creando también una modalidad nueva
   * @param create DTO para crear el convenio junto a la modalidad
   * @param pdfPath Ruta del archivo PDF subido
   * @param imagePath Ruta de la imagen subida (o la imagen por defecto)
   * @returns {Convenio} El convenio creado
   */
  async createConvenio(
    create: CreateConvenioDTO,
    pdfPath: string,
    imagePath: string,
  ) {
    const pathsArchivos: string[] = [pdfPath, imagePath];
    try {
      //usa == en lugar de === porque no sé si viene como string o numero
      const datosModalidad =
        create.idModalidad == 0
          ? { create: { nombreModalidad: create.nombreModalidad } }
          : { connect: { idModalidad: create.idModalidad } };
      const nuevoConvenio = await this.prisma.convenio.create({
        data: {
          titulo: create.titulo,
          centroPractica: create.centroPractica,
          fechaInicioConvenio: create.fechaInicioConvenio,
          fechaFinConvenio: create.fechaFinConvenio,
          documentoConvenio: pdfPath,
          urlFoto: imagePath,
          Modalidad: datosModalidad,
        },
      });

      return nuevoConvenio;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // unique constraint
        if (error.code === 'P2002') {
          console.error(error);
          try {
            //console.log(pathsArchivos);
            pathsArchivos.forEach((path) => {
              if (fs.existsSync(path)) {
                fs.unlinkSync(path); //si el nuevo convenio no es válido se borran sus archivos
              }
            });
          } catch (unlinkError) {
            console.error(`Error al eliminar el archivo`, unlinkError);
          }
          //lanza la excepción de duplicados
          throw new ForbiddenException('Información Duplicada');
        }
      } else {
        throw error;
      }
    }
  }
  /*
  /**
   * Usado para crear un convenio referenciando una modalidad ya creada
   * @param create DTO para crear el convenio junto al identificador de modalidad
   * @param pdfPath Ruta del archivo PDF subido
   * @param imagePath Ruta de la imagen subida (o la imagen por defecto)
   * @returns {Convenio} El convenio creado
   */
  /*
  async createConvenioConRefModalidad(
    create: CreateConvenioDTO,
    pdfPath: string,
    imagePath: string,
  ) {
    const pathsArchivos: string[] = [pdfPath, imagePath];
    try {
      const nuevoConvenio = await this.prisma.convenio.create({
        data: {
          titulo: create.titulo,
          centroPractica: create.centroPractica,
          fechaInicioConvenio: create.fechaInicioConvenio,
          fechaFinConvenio: create.fechaFinConvenio,
          documentoConvenio: pdfPath,
          urlFoto: imagePath,
          Modalidad: {
            connect: {
              idModalidad: create.idModalidad,
            },
          },
        },
      });

      return nuevoConvenio;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // unique constraint
        if (error.code === 'P2002') {
          console.error(error);
          try {
            //console.log(pathsArchivos);
            pathsArchivos.forEach((path) => {
              if (fs.existsSync(path)) {
                fs.unlinkSync(path); //si el nuevo convenio no es válido se borra
              }
            });
          } catch (unlinkError) {
            console.error(`Error al eliminar el archivo`, unlinkError);
          }
          throw new ForbiddenException('Información Duplicada');
        }
      } else {
        throw error;
      }
    }
  }
  */

  /**
   * Crea una modalidad nueva
   * @param create DTO para crear la modalidad
   * @returns {Modalidad} La modalidad creada
   */
  async createModalidad(create: Modalidad) {
    try {
      const nuevaModalidad = this.prisma.modalidad.create({
        data: create,
      });

      return nuevaModalidad;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          console.error(error);
          throw new ForbiddenException('Información Duplicada');
        }
      } else {
        throw error;
      }
    }
  }

  // Bloque Listar Convenios

  /**
   * Retorna el identificador y el nombre de las modalidades existentes
   * @returns {{ idModalidad: number; nombreModalidad: string }[]}
   * Ids y Nombres de las modalidades
   */
  private async getModalidades(): Promise<
    { idModalidad: number; nombreModalidad: string }[]
  > {
    const modalidades = await this.prisma.modalidad.findMany({
      select: {
        idModalidad: true,
        nombreModalidad: true,
      },
    });

    return modalidades;
  }

  /**
   * Método principal del BLoque
   * Devuelve un listado de DetalleConvenioDTO[] llamado listadoConvenios
   * acompañado de un arreglo llamado modalidades junto a su id y nombre
   * */
  async listarConvenios() {
    const resultado = await this.prisma.$queryRawTyped(conveniosListar());
    const modalidades = await this.getModalidades();
    const convenios = resultado.map((value) => {
      return {
        idConvenio: value.idConvenio,
        imagen: value.imagen,
        nombreConvenio: value.nombreConvenio,
        centroPractica: value.centroPractica,
        inicio: value.inicio,
        nombreModalidad: value.nombreModalidad,
      };
    }) as ListarConvenioDTO[];
    return {
      listadoConvenios: convenios,
      modalidades: modalidades,
    };
  }

  //Fin Bloque Listar Convenios
}
