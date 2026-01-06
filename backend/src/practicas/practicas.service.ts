import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Asignatura,
  Cursacion,
  Modalidad,
  PracticaTomada,
} from '@prisma/client';
import { DetallePracticasDTO, InfoPracticaDTO } from './dto/detalles.dto';
import { practicasGetDetallePorEstudiante } from '@prisma/client/sql';
import { EstudiantesService } from '../estudiantes/estudiantes.service';
import { InfoEstudianteDTO } from '../estudiantes/dto/avance.dto';
import {
  ListarPracticasPorConvenioDTO,
  PracticaEnConvenioDTO,
} from './dto/porConvenio.dto';
import { practicasGetPracticasDeConvenioUsandoId } from '@prisma/client/sql';
import { CursosService } from 'src/cursos/cursos.service';

@Injectable()
export class PracticasService {
  constructor(
    private prisma: PrismaService,
    private estudianteService: EstudiantesService,
    private cursoService: CursosService,
  ) {}

  /**
   * Retorna todas las asignaturas prácticas, independientes del plan
   * @returns {Asignatura[]} Prácticas de la carrera
   */
  async getAllPracticas() {
    return await this.prisma.asignatura.findMany({
      where: {
        caracter: 'PRACTICA',
      },
    });
  }

  /**
   * Retorna las asignaturas de práctica de la carrera
   * @param idPlan Identificador del plan
   * @returns {Asignatura[]} Prácticas del plan
   */
  async getAllPracticasDelPlan(idPlan: number): Promise<Asignatura[]> {
    return await this.prisma.asignatura.findMany({
      where: {
        idPlan: idPlan,
        AND: {
          caracter: 'PRACTICA',
        },
      },
    });
  }

  /**
   * Retorna todas las cursaciones de una asignatura práctica
   * de un plan especificado
   * @param codigoAsignatura
   * @returns
   */
  async getAllCursacionesPorCodigoAsignaturaPractica(
    idPlan: number,
    codigoAsignatura: string,
  ): Promise<Cursacion[]> {
    return await this.cursoService.getCursacionesPorCodigoDeAsignatura(
      idPlan,
      codigoAsignatura,
    );
  }

  /**
   * Retorna todas las cursaciones y prácticas relacionadas
   * a un estudiante
   * @param idEstudiante Id del estudiante
   */
  async getAllPracticasCursadasPorEstudiante(
    idEstudiante: number,
  ): Promise<PracticaTomada[]> {
    return this.prisma.practicaTomada.findMany({
      where: { idEstudiante: idEstudiante },
      include: {
        CursacionPractica: true,
      },
    });
  }

  /*
  //devuelve las asignaturas tomadas por estudiantes segun el
  //area de formacion de sus prerrequisitos
  //DESATAR CUANDO SEA NECESARIO
  async getAllPracticasCursadasPorAreaFormacion(
    areaFormacion: AREA,
  ): Promise<PracticaTomada[]> {
    return this.prisma.$queryRaw`
    SELECT pt.* FROM 
        PRACTICATOMADA pt 
                JOIN PRACTICA p ON (pt.idPractica = p.id)
                JOIN PLANCONTEMPLAASIGNATURA pc ON (pc.idPlan = p.idPlan) 
                JOIN TRIBUTACION ON (idAsignaturaTributada = pc.idAsignatura)
    WHERE pc.areaFormacion = ${areaFormacion}
    `;
  }
  */

  // Bloque Detalle de Practica por Estudiante
  /*
   * Retorna la información de prácticas realizadas por un solo estudiante
   * en el InfoPracticaDTO
   *
   * InfoPracticaDTO =
   *   { titulo, centroPractica, nombreModalidad, notaFinal, intento ... }
   *
   * Más info del dto en ./dto/detalles.dto.ts
   *
   * Es posible agregar más atributos modificando la consulta sql y el dto
   * de InfoPracticaDTO
   *
   * */
  private async getInfoPracticasDeEstudiante(
    idEstudiante: number,
  ): Promise<InfoPracticaDTO[]> {
    const resultado = await this.prisma.$queryRawTyped(
      practicasGetDetallePorEstudiante(idEstudiante),
    );

    return resultado.map((v) => {
      return {
        idCursacion: v.idCursacion,
        notaFinal: v.notaFinal,
        codigoAsignatura: v.codigoAsignatura,
        nombrePractica: v.nombrePractica,
        plan: v.plan,
        numIntento: v.numIntento,
        posicionRelativa: v.posicionRelativa.toNumber(),
        convenios: v.convenios,
        centrosDePractica: v.centrosDePractica,
        modadidades: v.modalidades,
      };
    }) as InfoPracticaDTO[];
  }

  // Método principal
  /*
   *  EJ:
   * {
   *   estudiante : InfoEstudianteDTO,
   *   practicas: InfoPracitcaDTO[]
   * }
   * */
  async getDetallePracticasDeEstudiante(idEstudiante: number) {
    const estudiante: InfoEstudianteDTO =
      await this.estudianteService.getEstudianteById(idEstudiante);

    if (!estudiante) throw NotFoundException;

    const infoPracticas: InfoPracticaDTO[] =
      await this.getInfoPracticasDeEstudiante(idEstudiante);

    return {
      estudiante: estudiante,
      practicas: infoPracticas,
    } as DetallePracticasDTO;
  }

  // FIN bloque detalle de practica por estudiante

  async getAllModalidades(): Promise<Modalidad[]> {
    const modalidades = await this.prisma.modalidad.findMany();

    return modalidades;
  }

  async getOneModalidad(idModalidad: number): Promise<Modalidad> {
    const modalidad = await this.prisma.modalidad.findUnique({
      where: {
        idModalidad: idModalidad,
      },
    });

    return modalidad;
  }

  //Bloque de prácticas por convenio
  private async getPracticasDeConvenio(
    idConvenio: number,
  ): Promise<PracticaEnConvenioDTO[]> {
    const resultadoPracticas = await this.prisma.$queryRawTyped(
      practicasGetPracticasDeConvenioUsandoId(idConvenio),
    );

    return resultadoPracticas.map((value) => {
      return {
        idEstudiante: value.idEstudiante,
        nombreCompleto: value.nombreCompleto,
        tituloPractica: value.tituloPractica,
        numeroPractica: value.numeroPractica.toNumber(),
        fechaInicio: value.fechaInicio,
        fechaFin: value.fechaFin,
        notaFinal: value.notaFinal,
        idModalidad: value.idModalidad,
        nombreModalidad: value.nombreModalidad,
      } as PracticaEnConvenioDTO;
    });
  }

  /*
   * Método principal del Bloque
   *
   * Retorna cada uno de las practicas asociadas a un convenio usando
   * ListarPracticasPorConvenioDTO
   *{
    "tituloConvenio": "Convenio con Servicio Local de Educación Pública Chinchorro (SLEP)",
    "practicas": [
        {
            "nombreCompleto": "Estudiante Numero Siete",
            "tituloPractica": "Currículo en contexto psicopedagógico",
            "numeroPractica": 4,
            "fechaInicio": "2024-02-13T00:00:00.000Z",
            "fechaFin": "2024-11-12T00:00:00.000Z",
            "notaFinal": 4.76
        },
        { ... },
        { ... },
    ]
   *
   *
   * */
  async listarPracticasPorConvenio(idConvenio: number) {
    const convenio = await this.prisma.convenio.findUnique({
      where: {
        idConvenio: idConvenio,
      },
      select: {
        titulo: true,
      },
    });

    const resultadoConsulta: PracticaEnConvenioDTO[] =
      await this.getPracticasDeConvenio(idConvenio);

    return {
      tituloConvenio: convenio.titulo,
      practicas: resultadoConsulta,
    } as ListarPracticasPorConvenioDTO;
  }

  //FIN bloque de prácticas por convenio
}
