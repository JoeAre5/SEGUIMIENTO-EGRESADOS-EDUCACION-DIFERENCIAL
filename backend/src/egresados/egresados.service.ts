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
    if (fecha.includes('T')) return new Date(fecha);
    return new Date(`${fecha}T00:00:00.000Z`);
  }

  // ✅ Helpers: normalizar tipos (por FormData todo llega string)
  private toIntOrNull(v: any): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'number' ? v : parseInt(String(v), 10);
    return Number.isFinite(n) ? n : null;
  }

  private toStrOrNull(v: any): string | null {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    return s.length ? s : null;
  }

  /* ===========================
    ✅ CREATE (o update si existe)
  =========================== */
  async create(dto: CreateEgresadoDto, archivos: Express.Multer.File[]) {
    dto.idEstudiante = Number(dto.idEstudiante);
    dto.fechaEgreso = dto.fechaEgreso?.toString();

    const fechaConvertida = dto.fechaEgreso ? this.parseFecha(dto.fechaEgreso) : null;

    const existe = await this.prisma.egresado.findUnique({
      where: { idEstudiante: dto.idEstudiante },
    });

    if (existe) {
      return this.updateByEstudiante(dto.idEstudiante, dto as any, archivos);
    }

    const { planEstudios, ..._rest } = dto as any;

    const egresado = await this.prisma.egresado.create({
      data: {
        // ✅ relación obligatoria => connect
        Estudiante: { connect: { idEstudiante: dto.idEstudiante } },

        fechaEgreso: fechaConvertida,

        anioFinEstudios: this.toIntOrNull((dto as any).anioFinEstudios),

        situacionActual: dto.situacionActual,
        situacionActualOtro:
          dto.situacionActual === 'Otro'
            ? this.toStrOrNull((dto as any).situacionActualOtro)
            : null,

        empresa: this.toStrOrNull(dto.empresa),
        cargo: this.toStrOrNull(dto.cargo),
        sueldo: dto.sueldo !== undefined ? this.toIntOrNull(dto.sueldo) : null,
        nivelRentas: (dto as any).nivelRentas ?? null,

        viaIngreso: this.toStrOrNull((dto as any).viaIngreso),
        viaIngresoOtro:
          (dto as any).viaIngreso === 'Otro'
            ? this.toStrOrNull((dto as any).viaIngresoOtro)
            : null,

        anioIngresoCarrera: this.toIntOrNull((dto as any).anioIngresoCarrera),

        genero: this.toStrOrNull((dto as any).genero),
        tiempoBusquedaTrabajo: this.toStrOrNull((dto as any).tiempoBusquedaTrabajo),

        sectorLaboral: this.toStrOrNull((dto as any).sectorLaboral),
        sectorLaboralOtro:
          (dto as any).sectorLaboral === 'Otro'
            ? this.toStrOrNull((dto as any).sectorLaboralOtro)
            : null,

        tipoEstablecimiento: this.toStrOrNull((dto as any).tipoEstablecimiento),
        tipoEstablecimientoOtro:
          (dto as any).tipoEstablecimiento === 'Otro'
            ? this.toStrOrNull((dto as any).tipoEstablecimientoOtro)
            : null,

        anioIngresoLaboral:
          dto.anioIngresoLaboral !== undefined
            ? this.toIntOrNull(dto.anioIngresoLaboral)
            : null,

        // ✅ FIX: NO enviar null; si no viene, Prisma usa @default(2026)
        ...(dto.anioSeguimiento !== undefined
          ? { anioSeguimiento: this.toIntOrNull(dto.anioSeguimiento) }
          : {}),

        telefono: this.toStrOrNull(dto.telefono),
        emailContacto: this.toStrOrNull(dto.emailContacto),
        direccion: this.toStrOrNull(dto.direccion),
        linkedin: this.toStrOrNull(dto.linkedin),
        contactoAlternativo: this.toStrOrNull(dto.contactoAlternativo),
      },
    });

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
          select: {
            rut: true,
            nombreCompleto: true,
            idPlan: true,
            Plan: {
              select: {
                idPlan: true,
                codigo: true,
                titulo: true,
                agnio: true,
                fechaInstauracion: true,
              },
            },
          },
        },
      },
      orderBy: { idEgresado: 'desc' },
    });
  }

  /* ===========================
    ✅ GET ONE (por idEstudiante)
  =========================== */
  async findOne(idEstudiante: number) {
    idEstudiante = Number(idEstudiante);

    const egresado = await this.prisma.egresado.findUnique({
      where: { idEstudiante },
      include: {
        documentos: true,
        Estudiante: {
          select: {
            rut: true,
            nombreCompleto: true,
            idPlan: true,
            Plan: {
              select: {
                idPlan: true,
                codigo: true,
                titulo: true,
                agnio: true,
                fechaInstauracion: true,
              },
            },
          },
        },
      },
    });

    if (!egresado) throw new NotFoundException('Egresado no encontrado');
    return egresado;
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

    const { planEstudios, ..._rest } = dto as any;

    const fechaConvertida = (dto as any).fechaEgreso
      ? this.parseFecha((dto as any).fechaEgreso.toString())
      : undefined;

    const dataUpdate: any = {
      ...(fechaConvertida ? { fechaEgreso: fechaConvertida } : {}),

      ...((dto as any).anioFinEstudios !== undefined
        ? { anioFinEstudios: this.toIntOrNull((dto as any).anioFinEstudios) }
        : {}),

      ...(dto.situacionActual !== undefined
        ? {
            situacionActual: dto.situacionActual,
            situacionActualOtro:
              dto.situacionActual === 'Otro'
                ? this.toStrOrNull((dto as any).situacionActualOtro)
                : null,
          }
        : {}),

      ...(dto.situacionActualOtro !== undefined && dto.situacionActual === undefined
        ? { situacionActualOtro: this.toStrOrNull((dto as any).situacionActualOtro) }
        : {}),

      ...(dto.empresa !== undefined ? { empresa: this.toStrOrNull(dto.empresa) } : {}),
      ...(dto.cargo !== undefined ? { cargo: this.toStrOrNull(dto.cargo) } : {}),
      ...(dto.sueldo !== undefined
        ? {
            sueldo:
              dto.sueldo !== null && dto.sueldo !== ('' as any)
                ? this.toIntOrNull(dto.sueldo)
                : null,
          }
        : {}),
      ...((dto as any).nivelRentas !== undefined
        ? { nivelRentas: (dto as any).nivelRentas ?? null }
        : {}),

      ...((dto as any).viaIngreso !== undefined
        ? { viaIngreso: this.toStrOrNull((dto as any).viaIngreso) }
        : {}),
      ...((dto as any).viaIngresoOtro !== undefined || (dto as any).viaIngreso !== undefined
        ? {
            viaIngresoOtro:
              (dto as any).viaIngreso === 'Otro'
                ? this.toStrOrNull((dto as any).viaIngresoOtro)
                : (dto as any).viaIngreso !== undefined
                ? null
                : undefined,
          }
        : {}),

      ...((dto as any).anioIngresoCarrera !== undefined
        ? { anioIngresoCarrera: this.toIntOrNull((dto as any).anioIngresoCarrera) }
        : {}),

      ...((dto as any).genero !== undefined
        ? { genero: this.toStrOrNull((dto as any).genero) }
        : {}),
      ...((dto as any).tiempoBusquedaTrabajo !== undefined
        ? {
            tiempoBusquedaTrabajo: this.toStrOrNull(
              (dto as any).tiempoBusquedaTrabajo,
            ),
          }
        : {}),

      ...((dto as any).sectorLaboral !== undefined
        ? { sectorLaboral: this.toStrOrNull((dto as any).sectorLaboral) }
        : {}),
      ...((dto as any).sectorLaboralOtro !== undefined || (dto as any).sectorLaboral !== undefined
        ? {
            sectorLaboralOtro:
              (dto as any).sectorLaboral === 'Otro'
                ? this.toStrOrNull((dto as any).sectorLaboralOtro)
                : (dto as any).sectorLaboral !== undefined
                ? null
                : undefined,
          }
        : {}),

      ...((dto as any).tipoEstablecimiento !== undefined
        ? {
            tipoEstablecimiento: this.toStrOrNull(
              (dto as any).tipoEstablecimiento,
            ),
          }
        : {}),
      ...((dto as any).tipoEstablecimientoOtro !== undefined ||
      (dto as any).tipoEstablecimiento !== undefined
        ? {
            tipoEstablecimientoOtro:
              (dto as any).tipoEstablecimiento === 'Otro'
                ? this.toStrOrNull((dto as any).tipoEstablecimientoOtro)
                : (dto as any).tipoEstablecimiento !== undefined
                ? null
                : undefined,
          }
        : {}),

      ...(dto.anioIngresoLaboral !== undefined
        ? { anioIngresoLaboral: this.toIntOrNull(dto.anioIngresoLaboral) }
        : {}),
      ...(dto.anioSeguimiento !== undefined
        ? { anioSeguimiento: this.toIntOrNull(dto.anioSeguimiento) }
        : {}),

      ...(dto.telefono !== undefined
        ? { telefono: this.toStrOrNull(dto.telefono) }
        : {}),
      ...(dto.emailContacto !== undefined
        ? { emailContacto: this.toStrOrNull(dto.emailContacto) }
        : {}),
      ...(dto.direccion !== undefined
        ? { direccion: this.toStrOrNull(dto.direccion) }
        : {}),
      ...(dto.linkedin !== undefined
        ? { linkedin: this.toStrOrNull(dto.linkedin) }
        : {}),
      ...(dto.contactoAlternativo !== undefined
        ? { contactoAlternativo: this.toStrOrNull(dto.contactoAlternativo) }
        : {}),
    };

    Object.keys(dataUpdate).forEach(
      (k) => dataUpdate[k] === undefined && delete dataUpdate[k],
    );

    await this.prisma.egresado.update({
      where: { idEstudiante },
      data: dataUpdate,
    });

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
    ✅ DASHBOARD POR COHORTE
    Cohorte = anioFinEstudios
  =========================== */
  async getDashboardCohortes() {
    // 1) Total por cohorte
    const porCohorte = await this.prisma.egresado.groupBy({
      by: ['anioFinEstudios'],
      _count: { _all: true },
      where: { anioFinEstudios: { not: null } },
      orderBy: { anioFinEstudios: 'desc' },
    });

    // 2) Por cohorte + situacion
    const porCohorteSituacion = await this.prisma.egresado.groupBy({
      by: ['anioFinEstudios', 'situacionActual'],
      _count: { _all: true },
      where: { anioFinEstudios: { not: null } },
    });

    // 3) Por cohorte + nivelRentas
    const porCohorteRentas = await this.prisma.egresado.groupBy({
      by: ['anioFinEstudios', 'nivelRentas'],
      _count: { _all: true },
      where: { anioFinEstudios: { not: null } },
    });

    // 4) Docs por cohorte (contar con/sin docs)
    const egresadosMin = await this.prisma.egresado.findMany({
      where: { anioFinEstudios: { not: null } },
      select: {
        anioFinEstudios: true,
        documentos: { select: { idDocumento: true } },
      },
    });

    const docsPorCohorte = new Map<number, { conDocs: number; sinDocs: number }>();
    for (const e of egresadosMin) {
      const anio = e.anioFinEstudios as number;
      const tiene = (e.documentos?.length ?? 0) > 0;

      if (!docsPorCohorte.has(anio)) docsPorCohorte.set(anio, { conDocs: 0, sinDocs: 0 });
      const ref = docsPorCohorte.get(anio)!;
      if (tiene) ref.conDocs += 1;
      else ref.sinDocs += 1;
    }

    // Normalizar shape amigable
    const cohortes = porCohorte
      .filter((x) => x.anioFinEstudios !== null)
      .map((x) => {
        const anio = x.anioFinEstudios as number;

        const situacion = { Trabajando: 0, Cesante: 0, Otro: 0 };

        for (const s of porCohorteSituacion) {
          if ((s.anioFinEstudios as number) !== anio) continue;
          const key = (s.situacionActual ?? 'Otro') as 'Trabajando' | 'Cesante' | 'Otro';
          if (situacion[key] !== undefined) situacion[key] = s._count._all;
        }

        const rentas: Record<string, number> = {};
        for (const r of porCohorteRentas) {
          if ((r.anioFinEstudios as number) !== anio) continue;
          const key = r.nivelRentas ?? 'Sin dato';
          rentas[key] = r._count._all;
        }

        const docs = docsPorCohorte.get(anio) ?? { conDocs: 0, sinDocs: 0 };

        return {
          anio,
          total: x._count._all,
          situacion,
          rentas,
          docs,
        };
      });

    return { cohortes };
  }

  /* ===========================
    ✅ DELETE DOCUMENTO POR ID
  =========================== */
  async deleteDocumento(idDocumento: number) {
    idDocumento = Number(idDocumento);

    const doc = await this.prisma.documentoEgresado.findUnique({
      where: { idDocumento },
    });

    if (!doc) throw new NotFoundException('Documento no encontrado');

    try {
      const rutaRelativa = doc.url.replace('/documents/', 'documents/');
      const ruta = join(process.cwd(), rutaRelativa);
      await unlink(ruta);
    } catch (err) {
      console.warn('⚠️ No se pudo eliminar el archivo físico:', err.message);
    }

    await this.prisma.documentoEgresado.delete({
      where: { idDocumento },
    });

    const egresado = await this.prisma.egresado.findUnique({
      where: { idEgresado: doc.idEgresado },
      include: {
        documentos: true,
        Estudiante: {
          select: {
            rut: true,
            nombreCompleto: true,
            idPlan: true,
            Plan: {
              select: {
                idPlan: true,
                codigo: true,
                titulo: true,
                agnio: true,
                fechaInstauracion: true,
              },
            },
          },
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
