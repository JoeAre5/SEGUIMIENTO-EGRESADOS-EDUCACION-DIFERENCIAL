import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEgresadoDto } from './dto/create-egresado.dto';
import { UpdateEgresadoDto } from './dto/update-egresado.dto';
import { Express } from 'express';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class EgresadosService {
  constructor(private prisma: PrismaService) {}

  // ✅ Helper: convierte "YYYY-MM-DD" o ISO en Date válida
  private parseFecha(fecha: string): Date {
    if (!fecha) return undefined;

    // si ya viene ISO completo
    if (fecha.includes('T')) return new Date(fecha);

    // si viene tipo 2020-05-20
    return new Date(`${fecha}T00:00:00.000Z`);
  }

  /* ===========================
    ✅ CREATE (o update si existe)
  =========================== */
  async create(dto: CreateEgresadoDto, archivos: Express.Multer.File[]) {
    dto.idEstudiante = Number(dto.idEstudiante);
    dto.fechaEgreso = dto.fechaEgreso?.toString();

    const fechaConvertida = this.parseFecha(dto.fechaEgreso);

    const existe = await this.prisma.egresado.findUnique({
      where: { idEstudiante: dto.idEstudiante },
    });

    if (existe) {
      return this.updateByEstudiante(dto.idEstudiante, dto as any, archivos);
    }

    const egresado = await this.prisma.egresado.create({
      data: {
        idEstudiante: dto.idEstudiante,
        fechaEgreso: fechaConvertida,
        situacionActual: dto.situacionActual,
        empresa: dto.empresa || null,
        cargo: dto.cargo || null,
        sueldo: dto.sueldo ? Number(dto.sueldo) : null,
        anioIngresoLaboral: dto.anioIngresoLaboral
          ? Number(dto.anioIngresoLaboral)
          : null,
        anioSeguimiento: dto.anioSeguimiento
          ? Number(dto.anioSeguimiento)
          : null,
        telefono: dto.telefono || null,
        emailContacto: dto.emailContacto || null,
        direccion: dto.direccion || null,
        linkedin: dto.linkedin || null,
        contactoAlternativo: dto.contactoAlternativo || null,
      },
    });

    // ✅ Guardar archivos (si vienen)
    if (archivos && archivos.length > 0) {
      const docs = archivos.map((f) => ({
        nombre: f.originalname,
        url: `/documents/egresados/${f.filename}`,
        idEgresado: egresado.idEgresado,
      }));

      await this.prisma.documentoEgresado.createMany({ data: docs });
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

    const fechaConvertida = dto.fechaEgreso
      ? this.parseFecha(dto.fechaEgreso.toString())
      : undefined;

    // ✅ Construimos solo lo que venga en dto
    const dataUpdate: any = {
      ...(fechaConvertida ? { fechaEgreso: fechaConvertida } : {}),
      ...(dto.situacionActual !== undefined
        ? { situacionActual: dto.situacionActual }
        : {}),
      ...(dto.empresa !== undefined ? { empresa: dto.empresa } : {}),
      ...(dto.cargo !== undefined ? { cargo: dto.cargo } : {}),
      ...(dto.sueldo !== undefined
        ? { sueldo: dto.sueldo ? Number(dto.sueldo) : null }
        : {}),
      ...(dto.anioIngresoLaboral !== undefined
        ? {
            anioIngresoLaboral: dto.anioIngresoLaboral
              ? Number(dto.anioIngresoLaboral)
              : null,
          }
        : {}),
      ...(dto.anioSeguimiento !== undefined
        ? {
            anioSeguimiento: dto.anioSeguimiento
              ? Number(dto.anioSeguimiento)
              : null,
          }
        : {}),
      ...(dto.telefono !== undefined ? { telefono: dto.telefono } : {}),
      ...(dto.emailContacto !== undefined
        ? { emailContacto: dto.emailContacto }
        : {}),
      ...(dto.direccion !== undefined ? { direccion: dto.direccion } : {}),
      ...(dto.linkedin !== undefined ? { linkedin: dto.linkedin } : {}),
      ...(dto.contactoAlternativo !== undefined
        ? { contactoAlternativo: dto.contactoAlternativo }
        : {}),
    };

    await this.prisma.egresado.update({
      where: { idEstudiante },
      data: dataUpdate,
    });

    // ✅ Guardar nuevos documentos sin borrar anteriores
    if (archivos && archivos.length > 0) {
      const docs = archivos.map((f) => ({
        nombre: f.originalname,
        url: `/documents/egresados/${f.filename}`,
        idEgresado: existe.idEgresado,
      }));

      await this.prisma.documentoEgresado.createMany({ data: docs });
    }

    return this.findOne(idEstudiante);
  }

  /* ===========================
    ✅ ✅ ✅ DELETE DOCUMENTO INDIVIDUAL (NUEVO)
    ✅ DELETE /egresados/documento/:idDocumento
  =========================== */
  async deleteDocumento(idDocumento: number) {
    idDocumento = Number(idDocumento);

    // ✅ 1. Buscar documento
    const doc = await this.prisma.documentoEgresado.findUnique({
      where: { idDocumento },
    });

    if (!doc) throw new NotFoundException('Documento no encontrado');

    // ✅ 2. Eliminar archivo físico
    try {
      // ✅ convierte "/documents/egresados/file.pdf" → "documents/egresados/file.pdf"
      const rutaRelativa = doc.url.replace('/documents/', 'documents/');
      const ruta = join(process.cwd(), rutaRelativa);

      await unlink(ruta);
    } catch (err: any) {
      console.warn('⚠️ No se pudo eliminar el archivo físico:', err.message);
    }

    // ✅ 3. Eliminar registro en BD
    await this.prisma.documentoEgresado.delete({
      where: { idDocumento },
    });

    // ✅ 4. Retornar egresado actualizado
    const egresado = await this.prisma.egresado.findUnique({
      where: { idEgresado: doc.idEgresado },
      include: {
        documentos: true,
        Estudiante: {
          select: { rut: true, nombreCompleto: true },
        },
      },
    });

    return egresado;
  }

  /* ===========================
    ✅ DELETE EGRESADO COMPLETO
  =========================== */
  async delete(idEgresado: number) {
    idEgresado = Number(idEgresado);

    await this.prisma.documentoEgresado.deleteMany({
      where: { idEgresado },
    });

    return this.prisma.egresado.delete({
      where: { idEgresado },
    });
  }
}
