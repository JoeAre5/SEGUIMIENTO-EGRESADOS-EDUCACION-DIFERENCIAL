import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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

import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';

@Injectable()
export class EstudiantesService {
  constructor(private prisma: PrismaService) {}

  // ✅ listar estudiantes (para egresados)
  async findAll() {
    return this.prisma.estudiante.findMany({
      select: {
        idEstudiante: true,
        nombreCompleto: true,
        rut: true,
        agnioIngreso: true,
      },
      orderBy: { nombreCompleto: 'asc' },
    });
  }

  // ✅ crear estudiante
  async create(dto: CreateEstudianteDto) {
    const existe = await this.prisma.estudiante.findUnique({
      where: { rut: dto.rut },
    });

    if (existe) {
      throw new BadRequestException('Ya existe un estudiante con ese RUT');
    }

    return this.prisma.estudiante.create({
      data: {
        rut: dto.rut,
        nombreCompleto: `${dto.nombre} ${dto.apellido}`.trim(),
        nombreSocial: dto.nombreSocial,
        agnioIngreso: dto.agnioIngreso,
        idPlan: dto.idPlan,
      },
    });
  }

  // ✅ actualizar estudiante
  async update(idEstudiante: number, dto: UpdateEstudianteDto) {
    const existe = await this.prisma.estudiante.findUnique({
      where: { idEstudiante },
    });

    if (!existe) throw new NotFoundException('Estudiante no encontrado');

    // validar rut si cambia
    if (dto.rut && dto.rut !== existe.rut) {
      const rutExiste = await this.prisma.estudiante.findUnique({
        where: { rut: dto.rut },
      });

      if (rutExiste)
        throw new BadRequestException('Ya existe otro estudiante con ese RUT');
    }

    // construir nombreCompleto si llega nombre o apellido
    let nombreCompleto = existe.nombreCompleto;

    const nombreActual = dto.nombre ?? existe.nombreCompleto.split(' ')[0];
    const apellidoActual =
      dto.apellido ?? existe.nombreCompleto.split(' ').slice(1).join(' ');

    if (dto.nombre || dto.apellido) {
      nombreCompleto = `${nombreActual} ${apellidoActual}`.trim();
    }

    return this.prisma.estudiante.update({
      where: { idEstudiante },
      data: {
        rut: dto.rut ?? undefined,
        nombreCompleto,
        nombreSocial: dto.nombreSocial ?? undefined,
        agnioIngreso: dto.agnioIngreso ?? undefined,
        idPlan: dto.idPlan ?? undefined,
      },
    });
  }

  // ✅ eliminar estudiante
  async delete(idEstudiante: number) {
    const existe = await this.prisma.estudiante.findUnique({
      where: { idEstudiante },
    });

    if (!existe) throw new NotFoundException('Estudiante no encontrado');

    return this.prisma.estudiante.delete({
      where: { idEstudiante },
    });
  }

  // ===============================
  // 🔥 AVANCE (ORIGINAL + FIX)
  // ===============================

  // ✅ FIX: si la query no devuelve filas, retornamos null
  async getEstudianteById(idEstudiante: number): Promise<InfoEstudianteDTO | null> {
    const infoEstudiante = await this.prisma.$queryRawTyped(
      estudiantesGetEstudiante(idEstudiante),
    );

    if (!infoEstudiante || infoEstudiante.length === 0) return null;

    const v = infoEstudiante[0];

    return {
      nombreCompleto: v.nombreCompleto,
      rut: v.rut,
      agnioIngreso: v.agnioIngreso,
      plan: v.plan,
      // promedio puede venir null si no hay cursaciones
      promedio: v.promedio ?? null,
    } as InfoEstudianteDTO;
  }

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

  // ✅ FIX PRINCIPAL: validar null antes de usar rut
  async obtAvanceDe(idEstudiante: number) {
    const infoEstudiante = await this.getEstudianteById(idEstudiante);

    if (!infoEstudiante || !infoEstudiante.rut) {
      throw new NotFoundException('El estudiante con ese id no existe');
    }

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
      cursosRealizados,
      avanceIndividual,
      avanceCohorte,
    } as AvanceDto;
  }

  private async listarCohortes(): Promise<number[]> {
    const resultCohortes = await this.prisma.estudiante.findMany({
      select: { agnioIngreso: true },
      distinct: ['agnioIngreso'],
    });

    return resultCohortes.flatMap((v) => v.agnioIngreso);
  }

  private async getAllEstudiantesCohorte(): Promise<InfoCohorteEstudianteDTO[]> {
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
        cohorte,
        estudiantes: mismoCohorte,
      } as ListarPorCohorteDTO);
    });

    return responseDto;
  }
}
