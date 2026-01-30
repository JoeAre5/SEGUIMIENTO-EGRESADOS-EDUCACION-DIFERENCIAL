import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEgresadoDto } from './dto/create-egresado.dto';
import { UpdateEgresadoDto } from './dto/update-egresado.dto';
import { Express } from 'express';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { ForbiddenException } from '@nestjs/common';
import { PdfService } from './pdf/pdf.service';

@Injectable()
export class EgresadosService {
  constructor(private prisma: PrismaService, private pdfService: PdfService) {}

  private parseFecha(fecha: string): Date | undefined {
    if (!fecha) return undefined;
    if (fecha.includes('T')) return new Date(fecha);
    return new Date(`${fecha}T00:00:00.000Z`);
  }

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

  async getConsentimientoMine(user: any) {
    const idEstudiante = user?.idEstudiante;
    if (!idEstudiante) {
      return { consentimientoEstado: 'PENDIENTE', consentimientoFecha: null };
    }

    const eg = await this.prisma.egresado.upsert({
      where: { idEstudiante },
      create: {
        Estudiante: { connect: { idEstudiante } },
        situacionActual: 'Otro',
      },
      update: {},
      select: {
        consentimientoEstado: true,
        consentimientoFecha: true,
      },
    });

    return eg;
  }

  async setConsentimientoMine(user: any, acepta: boolean) {
    const idEstudiante = user?.idEstudiante;
    if (!idEstudiante) {
      throw new ForbiddenException('No se pudo identificar al egresado.');
    }

    const estado = acepta ? 'ACEPTADO' : 'RECHAZADO';

    const eg = await this.prisma.egresado.upsert({
      where: { idEstudiante },
      create: {
        Estudiante: { connect: { idEstudiante } },
        situacionActual: 'Otro',
        consentimientoEstado: estado,
        consentimientoFecha: new Date(),
      },
      update: {
        consentimientoEstado: estado,
        consentimientoFecha: new Date(),
      },
      select: {
        consentimientoEstado: true,
        consentimientoFecha: true,
      },
    });

    return eg;
  }

  async findMine(idEstudiante: number) {
    const id = Number(idEstudiante);
    if (!id || Number.isNaN(id)) return null;

    const egresado = await this.prisma.egresado.findUnique({
      where: { idEstudiante: id },
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

    return egresado ?? null;
  }

  async upsertMine(
    idEstudiante: number,
    dto: CreateEgresadoDto | UpdateEgresadoDto,
    archivos: Express.Multer.File[],
  ) {
    const id = Number(idEstudiante);
    if (!id || Number.isNaN(id)) {
      throw new NotFoundException('No se pudo identificar al egresado autenticado');
    }

    const estado = await this.prisma.egresado.findUnique({
      where: { idEstudiante: id },
      select: { consentimientoEstado: true },
    });

    if (!estado || estado.consentimientoEstado !== 'ACEPTADO') {
      throw new ForbiddenException(
        'Debes aceptar el consentimiento para poder editar tu información.',
      );
    }

    const existe = await this.prisma.egresado.findUnique({
      where: { idEstudiante: id },
    });

    if (existe) {
      return this.updateByEstudiante(id, dto as any, archivos);
    }

    const dtoCreate: any = { ...(dto as any), idEstudiante: id };
    return this.create(dtoCreate, archivos);
  }

  async create(dto: CreateEgresadoDto, archivos: Express.Multer.File[]) {
    const idEst =
      dto?.idEstudiante !== undefined && dto?.idEstudiante !== null ? Number(dto.idEstudiante) : NaN;
    dto.idEstudiante = idEst as any;

    dto.fechaEgreso = dto.fechaEgreso?.toString();

    const fechaConvertida = dto.fechaEgreso ? this.parseFecha(dto.fechaEgreso) : null;

    const existe = await this.prisma.egresado.findUnique({
      where: { idEstudiante: dto.idEstudiante },
    });

    if (existe) {
      return this.updateByEstudiante(dto.idEstudiante, dto as any, archivos);
    }

    const egresado = await this.prisma.egresado.create({
      data: {
        Estudiante: { connect: { idEstudiante: dto.idEstudiante } },

        telefono: this.toStrOrNull(dto.telefono),
        direccion: this.toStrOrNull(dto.direccion),

        // Campos de seguimiento laboral (nuevo formulario)
        sectorLaboral: this.toStrOrNull((dto as any).sectorLaboral),
        sectorLaboralOtro: this.toStrOrNull((dto as any).sectorLaboralOtro),
        tiempoBusquedaTrabajo: this.toStrOrNull((dto as any).tiempoBusquedaTrabajo),
        tipoEstablecimiento: this.toStrOrNull((dto as any).tipoEstablecimiento),
        tipoEstablecimientoOtro: this.toStrOrNull((dto as any).tipoEstablecimientoOtro),
        viaIngreso: this.toStrOrNull((dto as any).viaIngreso),
        viaIngresoOtro: this.toStrOrNull((dto as any).viaIngresoOtro),

        fechaEgreso: fechaConvertida,
        anioFinEstudios: this.toIntOrNull((dto as any).anioFinEstudios),
        situacionActual: (dto as any).situacionActual ?? null,
        empresa: this.toStrOrNull((dto as any).empresa),
        cargo: this.toStrOrNull((dto as any).cargo),

        sueldo: dto.sueldo !== undefined ? this.toIntOrNull((dto as any).sueldo) : null,
        nivelRentas: (dto as any).nivelRentas ?? null,

        consentimientoEstado: (dto as any).consentimientoEstado ?? null,
        consentimientoFecha: (dto as any).consentimientoFecha ?? null,

      },

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

    if (archivos?.length) {
      const docs = archivos.map((file) => ({
        idEgresado: egresado.idEgresado,
        nombre: file.originalname,
        url: `/documents/egresados/${file.filename}`,
      }));

      await this.prisma.documentoEgresado.createMany({ data: docs });
    }

    return this.findOne(dto.idEstudiante);
  }

  async updateByEstudiante(
    idEstudiante: number,
    dto: UpdateEgresadoDto,
    archivos: Express.Multer.File[],
  ) {
    idEstudiante = Number(idEstudiante);
    dto.fechaEgreso = dto.fechaEgreso?.toString();
    const fechaConvertida = dto.fechaEgreso ? this.parseFecha(dto.fechaEgreso) : undefined;

    const existe = await this.prisma.egresado.findUnique({
      where: { idEstudiante },
    });

    if (!existe) throw new NotFoundException('Egresado no encontrado');

    await this.prisma.egresado.update({
      where: { idEstudiante },
      data: {
        telefono: dto.telefono !== undefined ? this.toStrOrNull(dto.telefono) : undefined,
        direccion: (dto as any).direccion !== undefined ? this.toStrOrNull((dto as any).direccion) : undefined,

        // Campos de seguimiento laboral (nuevo formulario)
        sectorLaboral: this.toStrOrNull((dto as any).sectorLaboral),
        sectorLaboralOtro: this.toStrOrNull((dto as any).sectorLaboralOtro),
        tiempoBusquedaTrabajo: this.toStrOrNull((dto as any).tiempoBusquedaTrabajo),
        tipoEstablecimiento: this.toStrOrNull((dto as any).tipoEstablecimiento),
        tipoEstablecimientoOtro: this.toStrOrNull((dto as any).tipoEstablecimientoOtro),
        viaIngreso: this.toStrOrNull((dto as any).viaIngreso),
        viaIngresoOtro: this.toStrOrNull((dto as any).viaIngresoOtro),


        fechaEgreso: dto.fechaEgreso !== undefined ? fechaConvertida : undefined,
        anioFinEstudios:
          (dto as any).anioFinEstudios !== undefined ? this.toIntOrNull((dto as any).anioFinEstudios) : undefined,
        situacionActual: (dto as any).situacionActual !== undefined ? (dto as any).situacionActual : undefined,
        empresa: (dto as any).empresa !== undefined ? this.toStrOrNull((dto as any).empresa) : undefined,
        cargo: (dto as any).cargo !== undefined ? this.toStrOrNull((dto as any).cargo) : undefined,

        sueldo: (dto as any).sueldo !== undefined ? this.toIntOrNull((dto as any).sueldo) : undefined,
        nivelRentas: (dto as any).nivelRentas !== undefined ? (dto as any).nivelRentas : undefined,

      },
    });

    if (archivos?.length) {
      const eg = await this.prisma.egresado.findUnique({
        where: { idEstudiante },
        select: { idEgresado: true },
      });

      if (!eg) throw new NotFoundException('Egresado no encontrado');

      const docs = archivos.map((file) => ({
        idEgresado: eg.idEgresado,
        nombre: file.originalname,
        url: `/documents/egresados/${file.filename}`,
      }));

      await this.prisma.documentoEgresado.createMany({ data: docs });
    }

    return this.findOne(idEstudiante);
  }

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

    return egresado;
  }

  async getDashboardCohortes() {
    const porCohorte = await this.prisma.egresado.groupBy({
      by: ['anioFinEstudios'],
      _count: { _all: true },
      where: { anioFinEstudios: { not: null } },
      orderBy: { anioFinEstudios: 'desc' },
    });

    const porCohorteSituacion = await this.prisma.egresado.groupBy({
      by: ['anioFinEstudios', 'situacionActual'],
      _count: { _all: true },
      where: { anioFinEstudios: { not: null } },
    });

    const porCohorteRentas = await this.prisma.egresado.groupBy({
      by: ['anioFinEstudios', 'nivelRentas'],
      _count: { _all: true },
      where: { anioFinEstudios: { not: null } },
    });

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

  async deleteDocumentoMine(idDocumento: number, idEstudiante: number) {
    idDocumento = Number(idDocumento);
    idEstudiante = Number(idEstudiante);

    const doc = await this.prisma.documentoEgresado.findUnique({
      where: { idDocumento },
    });

    if (!doc) throw new NotFoundException('Documento no encontrado');

    const egresado = await this.prisma.egresado.findUnique({
      where: { idEstudiante },
      select: { idEgresado: true },
    });

    if (!egresado) throw new NotFoundException('Egresado no encontrado');

    if (doc.idEgresado !== egresado.idEgresado) {
      throw new NotFoundException('Documento no encontrado');
    }

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

    return this.prisma.egresado.findUnique({
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
  }

  async delete(idEgresado: number) {
    idEgresado = Number(idEgresado);

    await this.prisma.documentoEgresado.deleteMany({
      where: { idEgresado },
    });

    return this.prisma.egresado.delete({
      where: { idEgresado },
    });
  }


  async generarFichaPdfByEstudiante(idEstudiante: number): Promise<Buffer> {
    const egresado = await this.findOne(Number(idEstudiante));
    if (!egresado) throw new NotFoundException('Egresado no encontrado');

    return this.pdfService.generarFichaEgresadoPdf({
      egresado,
      generadoEn: new Date(),
    });
  }

 
  async getReporteCohortesAnalitico(from?: number, to?: number) {
    const now = new Date();
    const currentYear = now.getFullYear();

    const hasFrom = Number.isFinite(Number(from));
    const hasTo = Number.isFinite(Number(to));

    // Si no se envía rango, el reporte incluye TODAS las cohortes con anioFinEstudios informado.
    const anioFilter: any =
      !hasFrom && !hasTo
        ? { not: null }
        : {
            not: null,
            ...(hasFrom ? { gte: Number(from) } : {}),
            ...(hasTo ? { lte: Number(to) } : {}),
            // si solo viene from, cerramos hasta el año actual
            ...(!hasTo && hasFrom ? { lte: currentYear } : {}),
            // si solo viene to, dejamos desde 0
            ...(!hasFrom && hasTo ? { gte: 0 } : {}),
          };

    // Traemos los egresados del rango (o todos si no hay rango).
    // NOTA: mantenemos sueldo por compatibilidad, pero la renta estimada se calcula desde nivelRentas.
    const egresados = await this.prisma.egresado.findMany({
      where: { anioFinEstudios: anioFilter },
      select: {
        anioFinEstudios: true,
        situacionActual: true,
        // compat
        sueldo: true,
        // proxy real
        nivelRentas: true,
        genero: true,
        documentos: { select: { idDocumento: true } },
        Estudiante: { select: { rut: true, nombreCompleto: true } },
      },
    });

    // Buckets por mínimo estimado (sin 'k', números completos)
    const bucketLabelFromMin = (v: number) => {
      if (v < 500000) return '< $500.000';
      if (v < 700000) return '$500.000 – $699.999';
      if (v < 900000) return '$700.000 – $899.999';
      if (v < 1200000) return '$900.000 – $1.199.999';
      return '≥ $1.200.000';
    };

    const median = (arr: number[]) => {
      if (!arr.length) return null;
      const a = [...arr].sort((x, y) => x - y);
      const mid = Math.floor(a.length / 2);
      return a.length % 2 === 0 ? Math.round((a[mid - 1] + a[mid]) / 2) : a[mid];
    };

    const avg = (arr: number[]) => {
      if (!arr.length) return null;
      return Math.round(arr.reduce((s, x) => s + x, 0) / arr.length);
    };

    const cohortesMap = new Map<number, any>();

    for (const e of egresados) {
      const anio = Number(e.anioFinEstudios);
      if (!Number.isFinite(anio)) continue;

      if (!cohortesMap.has(anio)) {
        cohortesMap.set(anio, {
          anio,
          total: 0,
          situacion: { Trabajando: 0, Cesante: 0, Otro: 0 },
          docs: { conDocs: 0, sinDocs: 0 },
          sueldos: [] as number[], // aquí guardamos mínimos estimados
          buckets: {
            '< $500.000': 0,
            '$500.000 – $699.999': 0,
            '$700.000 – $899.999': 0,
            '$900.000 – $1.199.999': 0,
            '≥ $1.200.000': 0,
          } as Record<string, number>,
        });
      }

      const ref = cohortesMap.get(anio);
      ref.total += 1;

      const sit = (e.situacionActual ?? 'Otro') as 'Trabajando' | 'Cesante' | 'Otro';
      if (ref.situacion[sit] !== undefined) ref.situacion[sit] += 1;
      else ref.situacion.Otro += 1;

      const tieneDocs = (e.documentos?.length ?? 0) > 0;
      if (tieneDocs) ref.docs.conDocs += 1;
      else ref.docs.sinDocs += 1;

      // Renta estimada:
      // - Primero intentamos desde nivelRentas (mínimo del rango declarado).
      // - Si no existe, usamos sueldo (si tu esquema lo tiene) como fallback.
      const estMin =
        this.rentasToMinValue((e as any).nivelRentas) ??
        (typeof (e as any).sueldo === 'number' && Number.isFinite((e as any).sueldo) && (e as any).sueldo > 0
          ? (e as any).sueldo
          : null);

      if (typeof estMin === 'number' && Number.isFinite(estMin)) {
        ref.sueldos.push(estMin);
        ref.buckets[bucketLabelFromMin(estMin)] += 1;
      }
    }

    const cohortes = Array.from(cohortesMap.values()).sort((a, b) => b.anio - a.anio);

    for (const c of cohortes) {
      c.empleabilidadPct = c.total ? Math.round((c.situacion.Trabajando / c.total) * 100) : 0;
      c.docsPct = c.total ? Math.round((c.docs.conDocs / c.total) * 100) : 0;

      c.sueldoStats = {
        count: c.sueldos.length,
        avg: avg(c.sueldos),
        median: median(c.sueldos),
        min: c.sueldos.length ? Math.min(...c.sueldos) : null,
        max: c.sueldos.length ? Math.max(...c.sueldos) : null,
        buckets: c.buckets,
      };
    }

    const total = cohortes.reduce((s, c) => s + c.total, 0);
    const totalTrabajando = cohortes.reduce((s, c) => s + c.situacion.Trabajando, 0);
    const globalEmpleabilidad = total ? Math.round((totalTrabajando / total) * 100) : 0;

    const totalConDocs = cohortes.reduce((s, c) => s + c.docs.conDocs, 0);
    const globalDocs = total ? Math.round((totalConDocs / total) * 100) : 0;

    // Rango reportado (si no viene, lo inferimos desde las cohortes retornadas)
    const years = cohortes.map((c) => c.anio);
    const reportFrom = hasFrom ? Number(from) : years.length ? Math.min(...years) : currentYear;
    const reportTo = hasTo ? Number(to) : hasFrom ? currentYear : years.length ? Math.max(...years) : currentYear;

    // =========================
    // GRÁFICAS RESUMEN (GLOBAL)
    // =========================
    // Género (no depende de nivelRentas)
    const generoCounts: Record<string, number> = {
      Masculino: 0,
      Femenino: 0,
      'Otro/No informa': 0,
    };

    for (const e of egresados) {
      const g = String((e as any).genero ?? '').trim().toLowerCase();
      if (!g) generoCounts['Otro/No informa'] += 1;
      else if (g.startsWith('m')) generoCounts.Masculino += 1;
      else if (g.startsWith('f')) generoCounts.Femenino += 1;
      else generoCounts['Otro/No informa'] += 1;
    }

    const generoArrRaw = Object.entries(generoCounts).map(([label, count]) => ({ label, count }));
    const generoTotal = generoArrRaw.reduce((a, x) => a + x.count, 0) || 1;
    const generoMax = Math.max(...generoArrRaw.map((x) => x.count), 1);

    const generoArr = generoArrRaw.map((x) => ({
      label: x.label,
      count: x.count,
      pct: Math.round((x.count / generoTotal) * 100),
      barPctOfMax: Math.round((x.count / generoMax) * 100),
    }));

    // Cohortes (conteo por año)
    const cohCounts = new Map<number, number>();
    for (const c of cohortes) {
      cohCounts.set(c.anio, c.total);
    }
    const cohItems = Array.from(cohCounts.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => b.year - a.year);

    const cohTotal = cohItems.reduce((a, x) => a + x.count, 0) || 1;
    const cohMax = Math.max(...cohItems.map((x) => x.count), 1);

    const cohortesGraf = cohItems.map((x) => ({
      label: String(x.year),
      count: x.count,
      pct: Math.round((x.count / cohTotal) * 100),
      barPctOfMax: Math.round((x.count / cohMax) * 100),
    }));

    return {
      from: reportFrom,
      to: reportTo,
      generadoEn: now,
      resumen: {
        totalEgresados: total,
        totalTrabajando,
        empleabilidadGlobalPct: globalEmpleabilidad,
        docsGlobalPct: globalDocs,
      },
      cohortes,
      graficas: {
        genero: generoArr,
        cohortes: cohortesGraf,
      },
    };
  }

  
  async generarReporteCohortesPdf(from?: number, to?: number): Promise<Buffer> {
    const data = await this.getReporteCohortesAnalitico(from, to);
    return this.pdfService.generarReporteCohortesPdf(data);
  }

  private rentasToMinValue(nivel: string | null | undefined): number | null {
  if (!nivel) return null;
  const s = String(nivel);

  // Captura números tipo 500.001, 1.000.000, 700000, etc.
  const nums = s
    .replace(/\./g, '')                 // 1.000.000 -> 1000000
    .match(/\d{3,}/g)                   // números largos
    ?.map(n => parseInt(n, 10))
    .filter(n => Number.isFinite(n)) ?? [];

  if (!nums.length) return null;

  // Si es "Menos de $500.000" -> usa 0 como mínimo
  if (/<\s*\$?/i.test(s) || /men(os|or)\s+de/i.test(s)) return 0;

  // Si es "Más de $1.200.000" -> mínimo = ese valor
  if (/m(a|á)s\s+de/i.test(s) || />=\s*\$?/i.test(s) || />\s*\$?/i.test(s)) return nums[0];

  // Si es "Entre X y Y" -> mínimo = X
  return nums[0];
}

private median(values: number[]): number | null {
  if (!values.length) return null;
  const arr = [...values].sort((a,b) => a-b);
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[mid] : Math.round((arr[mid - 1] + arr[mid]) / 2);
}

private average(values: number[]): number | null {
  if (!values.length) return null;
  return Math.round(values.reduce((a,b) => a+b, 0) / values.length);
}

private bucketLabelFromMin(v: number): '< $500.000' | '$500.000 – $699.999' | '$700.000 – $899.999' | '$900.000 – $1.199.999' | '≥ $1.200.000' {
  if (v < 500000) return '< $500.000';
  if (v < 700000) return '$500.000 – $699.999';
  if (v < 900000) return '$700.000 – $899.999';
  if (v < 1200000) return '$900.000 – $1.199.999';
  return '≥ $1.200.000';
}

}