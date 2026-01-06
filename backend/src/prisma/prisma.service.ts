import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    await this.sincronizarSecuencias();
  }
  async sincronizarSecuencias() {
    // Sincronizar secuencia de Asignatura
    await this.$executeRawUnsafe(
      `SELECT SETVAL('public."Asignatura_idAsignatura_seq"', COALESCE((SELECT MAX("idAsignatura") FROM public."Asignatura"), 1), true);`,
    );

    // Sincronizar secuencia de LineaAsignatura
    await this.$executeRawUnsafe(
      `SELECT SETVAL('public."LineaAsignatura_idLinea_seq"', COALESCE((SELECT MAX("idLinea") FROM public."LineaAsignatura"), 1), true);`,
    );

    // Sincronizar secuencia de DocumentoEND
    await this.$executeRawUnsafe(
      `SELECT SETVAL('public."DocumentoEND_idDato_seq"', COALESCE((SELECT MAX("idDato") FROM public."DocumentoEND"), 1), true);`,
    );

    // Sincronizar secuencia de Estudiante
    await this.$executeRawUnsafe(
      `SELECT SETVAL('public."Estudiante_idEstudiante_seq"', COALESCE((SELECT MAX("idEstudiante") FROM public."Estudiante"), 1), true);`,
    );

    // Sincronizar secuencia de Cursacion
    await this.$executeRawUnsafe(
      `SELECT SETVAL('public."Cursacion_idCursacion_seq"', COALESCE((SELECT MAX("idCursacion") FROM public."Cursacion"), 1), true);`,
    );

    // Sincronizar secuencia de Plan
    await this.$executeRawUnsafe(
      `SELECT SETVAL('public."Plan_idPlan_seq"', COALESCE((SELECT MAX("idPlan") FROM public."Plan"), 1), true);`,
    );

    // Sincronizar secuencia de Convenio
    await this.$executeRawUnsafe(
      `SELECT SETVAL('public."Convenio_idConvenio_seq"', COALESCE((SELECT MAX("idConvenio") FROM public."Convenio"), 1), true);`,
    );

    // Sincronizar secuencia de Modalidad
    await this.$executeRawUnsafe(
      `SELECT SETVAL('public."Modalidad_idModalidad_seq"', COALESCE((SELECT MAX("idModalidad") FROM public."Modalidad"), 1), true);`,
    );

    // Sincronizar secuencia de Usuario
    await this.$executeRawUnsafe(
      `SELECT SETVAL('public."Usuario_id_seq"', COALESCE((SELECT MAX("id") FROM public."Usuario"), 1), true);`,
    );

    console.log('Sincronización de secuencias completada exitosamente.');
  }
}
