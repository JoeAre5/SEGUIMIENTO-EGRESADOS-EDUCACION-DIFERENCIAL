import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  estudiantesGetEstudiante,
  estudiantesGetCursos,
  estudiantesGetPromedioIndividualPorSemestre,
  estudiantesGetPromedioCohortePorSemestre,
} from '@prisma/client/sql';
import {
  AvanceDto,
  CursoEstudianteDTO,
  InfoEstudianteDTO,
  SemestreRealizadoDTO,
} from './dto/avance.dto';
import {
  InfoCohorteEstudianteDTO,
  ListarPorCohorteDTO,
} from './dto/cohortes.dto';
@Injectable()
export class EstudiantesService {
  constructor(private prisma: PrismaService) {}

  // Bloque de Avance de estudiante
  //

  /*
   * Retorna la información de un estudiante utilizando el dto
   * InfoEstudianteDTO
   * EJ
   * {
   *  nombreCompleto: "Nombre Completo",
   *  rut: "21.111.111-1",
   *  agnioIngreso: 2024,
   *  plan: 2020
   * }
   * */
  async getEstudianteById(idEstudiante: number) {
    const infoEstudiante = await this.prisma.$queryRawTyped(
      estudiantesGetEstudiante(idEstudiante),
    );
    return infoEstudiante.map((value) => {
      return {
        nombreCompleto: value.nombreCompleto,
        rut: value.rut,
        agnioIngreso: value.agnioIngreso,
        plan: value.plan,
        promedio: value.promedio,
      };
    })[0] as InfoEstudianteDTO;
    //marca el [0] porque la respuesta de la bd es un arreglo con un sólo elemento
  }

  /*
   * Retorna la información los cursos que ha realizado el estudiante usando
   * CursoEstudianteDTO[]
   * EJ
   * [
   *  {
   *    idAsignatura: 1,
   *    codigo: "FI-2021",
   *    areaFormacion: "FP"
   *    agnioRealizacion: 2024,
   *    semestreRealizacion: 3,
   *    numIntento: 1,
   *    notaFinal: 1
   *  },
   * { ... },
   * { ... }
   * ]
   * */
  async getInfoCursosDeEstudiante(rut: string) {
    const infoCursos = await this.prisma.$queryRawTyped(
      estudiantesGetCursos(rut),
    );
    return infoCursos.map((value) => {
      return {
        idAsignatura: value.idAsignatura,
        nombreAsignatura: value.nombre,
        codigo: value.codigo,
        areaFormacion: value.areaFormacion,
        agnioRealizacion: value.agnio,
        semestreRealizacion: value.semestreRelativo,
        notaFinal: value.notaFinal,
      };
    }) as CursoEstudianteDTO[];
  }

  /*
   * Retorna la información del promedio del estudiante a lo largo
   * de los semestres que ha rendido utilizando
   * SemestreRealizadoDTO[]
   * EJ
   * [
   *   {
   *     numSemestre: 1,
   *     promedio: 6.5
   *   },
   *   {
   *     numSemestre: 2,
   *     promedio: 6.4
   *   }
   *   ...
   * ]
   * */
  async getPromedioIndividualPorSemestre(
    rut: string,
  ): Promise<SemestreRealizadoDTO[]> {
    const infoPromedio = await this.prisma.$queryRawTyped(
      estudiantesGetPromedioIndividualPorSemestre(rut),
    );
    return infoPromedio.map((value) => {
      return {
        numSemestre: value.semestreRelativo,
        promedio: value.promedio,
      };
    }) as SemestreRealizadoDTO[];
  }

  /*
   * Retorna la información del promedio de un cohorte o generación a lo largo
   * de los semestres que han rendido utilizando
   * SemestreRealizadoDTO[]
   * EJ
   * [
   *   {
   *     numSemestre: 1,
   *     promedio: 6.5
   *   },
   *   {
   *     numSemestre: 2,
   *     promedio: 6.4
   *   }
   *   ...
   * ]
   * */
  async getPromedioDeCohortePorSemestre(
    agnioCohorte: number,
  ): Promise<SemestreRealizadoDTO[]> {
    const infoPromedio = await this.prisma.$queryRawTyped(
      estudiantesGetPromedioCohortePorSemestre(agnioCohorte),
    );
    return infoPromedio.map((value) => {
      return {
        numSemestre: value.semestreRelativo,
        promedio: value.promedio,
      };
    }) as SemestreRealizadoDTO[];
  }

  async obtAvanceDe(idEstudiante: number) {
    const infoEstudiante = await this.getEstudianteById(idEstudiante);
    if (!infoEstudiante.rut)
      throw new NotFoundException('El estudiante con ese id no existe');

    const rut = infoEstudiante.rut;
    const cohorte = infoEstudiante.agnioIngreso;
    const [cursosRealizados, avanceIndividual, avanceCohorte] =
      await Promise.all([
        this.getInfoCursosDeEstudiante(rut),
        this.getPromedioIndividualPorSemestre(rut),
        this.getPromedioDeCohortePorSemestre(cohorte),
      ]);

    return {
      estudiante: infoEstudiante,
      cursosRealizados: cursosRealizados,
      avanceIndividual: avanceIndividual,
      avanceCohorte: avanceCohorte,
    } as AvanceDto;
  }

  //Bloque de Obtener a todos los estudiantes

  private async listarCohortes(): Promise<number[]> {
    const resultCohortes = await this.prisma.estudiante.findMany({
      select: {
        agnioIngreso: true,
      },
      distinct: ['agnioIngreso'],
    });

    return resultCohortes.flatMap((v) => {
      return v.agnioIngreso;
    });
  }

  private async getAllEstudiantesCohorte(): Promise<
    InfoCohorteEstudianteDTO[]
  > {
    const resultadoEstudiantes = await this.prisma.estudiante.findMany({
      select: {
        idEstudiante: true,
        nombreCompleto: true,
        agnioIngreso: true,
        rut: true,
      },
    });

    return resultadoEstudiantes.map((value) => {
      return {
        idEstudiante: value.idEstudiante,
        nombreCompleto: value.nombreCompleto,
        rut: value.rut,
        agnio_cohorte: value.agnioIngreso,
      } as InfoCohorteEstudianteDTO;
    });
  }

  /*
   * Método Principal del Bloque
   *
   * Retorna cada uno de los estudiantes ordenados y clasificados por cohorte usando
   * ListarPorCohorteDTO[]
   * [
   *     {
   *       "cohorte": 2020,
   *       "estudiantes": [
   *           {
   *               "nombre_completo": "Estudiante Numero Dos",
   *               "rut": "22.222.222-2",
   *               "agnio_cohorte": 2020
   *           },
   *           { ... },
   *           { ... },
   *       ]
   *     },
   *     { ... },
   *     { ... },
   * ]
   * */
  async getEstudiantesPorCohorte() {
    const cohortes = await this.listarCohortes();
    const estudiantes = await this.getAllEstudiantesCohorte();
    const responseDto: ListarPorCohorteDTO[] = [];

    cohortes.forEach((cohorte) => {
      const mismoCohorte: InfoCohorteEstudianteDTO[] = [];
      estudiantes.forEach((e) => {
        if (e.agnio_cohorte == cohorte) mismoCohorte.push(e);
      });
      responseDto.push({
        cohorte: cohorte,
        estudiantes: mismoCohorte,
      } as ListarPorCohorteDTO);
    });
    return responseDto;
  }
}

// FIN Bloque listar a todos los estudiantes
