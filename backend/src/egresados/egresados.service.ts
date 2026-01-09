import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEgresadoDto } from './dto/create-egresado.dto';
import { UpdateEgresadoDto } from './dto/update-egresado.dto';
import { Express } from 'express';

@Injectable()
export class EgresadosService {
  constructor(private prisma: PrismaService) {}

  // ✅ Helper: convierte "YYYY-MM-DD" a Date ISO válido
  private parseFecha(fecha: string): Date {
    if (!fecha) return null;

    // si ya viene con formato ISO completo, Prisma la acepta
    if (fecha.includes('T')) return new Date(fecha);

    // si viene tipo 2020-05-20 -> convertirlo
    return new Date(`${fecha}T00:00:00.000Z`);
  }

  /* ===========================
    ✅ CREATE (o update si existe)
  =========================== */
  async create(dto: CreateEgresadoDto, archivos: Express.Multer.File[]) {
    dto.idEstudiante = Number(dto.idEstudiante);
    dto.fechaEgreso = dto.fechaEgreso?.toString();

    // ✅ convertimos fechaEgreso al formato correcto
    const fechaConvertida = this.parseFecha(dto.fechaEgreso);

    const existe = await this.prisma.egresado.findUnique({
      where: { idEstudiante: dto.idEstudiante },
    });

    if (existe) {
      return this.updateByEstudiante(dto.idEstudiante, dto, archivos);
    }

    // ✅ Crear egresado nuevo
    const egresado = await this.prisma.egresado.create({
      data: {
        idEstudiante: dto.idEstudiante,
        fechaEgreso: fechaConvertida,
        situacionActual: dto.situacionActual,
        empresa: dto.empresa,
        cargo: dto.cargo,
        sueldo: dto.sueldo ? Number(dto.sueldo) : null,
        anioIngresoLaboral: dto.anioIngresoLaboral ? Number(dto.anioIngresoLaboral) : null,
        anioSeguimiento: dto.anioSeguimiento ? Number(dto.anioSeguimiento) : null,
        telefono: dto.telefono,
        emailContacto: dto.emailContacto,
        direccion: dto.direccion,
        linkedin: dto.linkedin,
        contactoAlternativo: dto.contactoAlternativo,
      },
    });

    // ✅ Si vienen archivos, los guardamos en DocumentoEgresado
    if (archivos && archivos.length > 0) {
      const docs = archivos.map((f) => ({
        nombre: f.originalname,
        url: `/documents/egresados/${f.filename}`,
        idEgresado: egresado.idEgresado,
      }));

      await this.prisma.documentoEgresado.createMany({
        data: docs,
      });
    }

    return this.findOne(dto.idEstudiante);
  }

  /* ===========================
    ✅ GET ALL
  =========================== */
  async findAll() {
    return this.prisma.egresado.findMany({
      include: {
        documentos: true,
        Estudiante: {
          select: { rut: true, nombreCompleto: true },
        },
      },
      orderBy: { idEgresado: 'desc' },
    });
  }

  /* ===========================
    ✅ GET ONE (por idEstudiante)
  =========================== */
  async findOne(idEstudiante: number) {
    return this.prisma.egresado.findUnique({
      where: { idEstudiante: Number(idEstudiante) },
      include: {
        documentos: true,
        Estudiante: {
          select: { rut: true, nombreCompleto: true },
        },
      },
    });
  }

  /* ===========================
    ✅ PATCH updateByEstudiante
  =========================== */
  async updateByEstudiante(
    idEstudiante: number,
    dto: UpdateEgresadoDto,
    archivos: Express.Multer.File[],
  ) {
    idEstudiante = Number(idEstudiante);

    const existe = await this.prisma.egresado.findUnique({
      where: { idEstudiante },
    });

    if (!existe) throw new NotFoundException('Egresado no encontrado');

    const fechaConvertida = dto.fechaEgreso ? this.parseFecha(dto.fechaEgreso.toString()) : undefined;

    // ✅ Update datos
    await this.prisma.egresado.update({
      where: { idEstudiante },
      data: {
        ...(fechaConvertida ? { fechaEgreso: fechaConvertida } : {}),
        situacionActual: dto.situacionActual,
        empresa: dto.empresa,
        cargo: dto.cargo,
        sueldo: dto.sueldo ? Number(dto.sueldo) : null,
        anioIngresoLaboral: dto.anioIngresoLaboral ? Number(dto.anioIngresoLaboral) : null,
        anioSeguimiento: dto.anioSeguimiento ? Number(dto.anioSeguimiento) : null,
        telefono: dto.telefono,
        emailContacto: dto.emailContacto,
        direccion: dto.direccion,
        linkedin: dto.linkedin,
        contactoAlternativo: dto.contactoAlternativo,
      },
    });

    // ✅ Guardar nuevos documentos SIN borrar anteriores
    if (archivos && archivos.length > 0) {
      const docs = archivos.map((f) => ({
        nombre: f.originalname,
        url: `/documents/egresados/${f.filename}`,
        idEgresado: existe.idEgresado,
      }));

      await this.prisma.documentoEgresado.createMany({
        data: docs,
      });
    }

    return this.findOne(idEstudiante);
  }

  /* ===========================
    ✅ DELETE
  =========================== */
  async delete(idEgresado: number) {
    idEgresado = Number(idEgresado);

    // eliminar docs primero
    await this.prisma.documentoEgresado.deleteMany({
      where: { idEgresado },
    });

    return this.prisma.egresado.delete({
      where: { idEgresado },
    });
  }
}
