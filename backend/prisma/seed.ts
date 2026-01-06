import {
  Asignatura,
  Convenio,
  Cursacion,
  Estudiante,
  LineaAsignatura,
  NIVEL,
  Plan,
  PracticaTomada,
  PrismaClient,
  PTConvenio,
  ResultadoEND,
  Usuario,
} from '@prisma/client';

import * as constants from './seed-constants';
import * as util from 'util';
import * as argon from 'argon2';

const prisma = new PrismaClient();

async function main() {
  // =============================
  // PLANES
  // =============================
  const planesInsertados: Plan[] = await prisma.plan.createManyAndReturn({
    data: constants.PLANES,
    skipDuplicates: true,
  });
  moreLog(planesInsertados);

  // =============================
  // ESTUDIANTES
  // =============================
  const estudiantesInsertados: Estudiante[] =
    await prisma.estudiante.createManyAndReturn({
      data: constants.generarEstudiantes(
        400,
        planesInsertados.map((p) => p.idPlan),
      ),
      skipDuplicates: true,
    });

  moreLog(estudiantesInsertados);

  // =============================
  // LINEAS ASIGNATURAS
  // =============================
  console.time('LINEA_ASIGNATURA SEEDING');
  console.info('El seeding de las lineas de asignaturas está comenzando');

  const lineasQueries: LineaAsignatura[] = [];
  for (const linea of constants.LINEA_ASIGNATURA) {
    for (const plan of planesInsertados) {
      lineasQueries.push({
        idLinea: linea.idLinea,
        idPlan: plan.idPlan,
        titulo: linea.titulo,
        color: linea.color,
      });
    }
  }

  const lineasAsignaturas = await prisma.lineaAsignatura.createManyAndReturn({
    data: lineasQueries,
    skipDuplicates: true,
  });

  moreLog(lineasAsignaturas);

  console.timeEnd('LINEA_ASIGNATURA SEEDING');
  console.info('El seeding de lineas de asignaturas termino');

  // =============================
  // ASIGNATURAS
  // =============================
  const asignaturasQueries: any[] = [];
  for (const plan of planesInsertados) {
    for (const asignatura of constants.ASIGNATURAS) {
      asignaturasQueries.push({
        ...asignatura,
        idPlan: plan.idPlan,
      });
    }
  }

  const asignaturasInsertadas: Asignatura[] =
    await prisma.asignatura.createManyAndReturn({
      data: asignaturasQueries,
      skipDuplicates: true,
    });

  moreLog(asignaturasInsertadas);

  // =============================
  // CURSACIONES
  // =============================
  console.info('Comienzo seeding cursaciones');
  console.time('CURSACIONES SEEDING');

  const cursacionesQueries: Cursacion[] = [];

  const planes = await prisma.plan.findMany();
  const asignaturas = await prisma.asignatura.findMany();
  const estudiantes = await prisma.estudiante.findMany();

  for (const plan of planes) {
    const asignaturasPorPlan = asignaturas.filter((a) => a.idPlan === plan.idPlan);

    for (const estudiante of estudiantes.filter((e) => e.idPlan === plan.idPlan)) {
      const nroAsignaturasCursadas = calcularNroAsignaturasCursadas(
        estudiante.agnioIngreso,
        asignaturasPorPlan.length,
      );

      let cursacionId = 1;

      for (const asignaturaCursada of asignaturasPorPlan.slice(0, nroAsignaturasCursadas)) {
        const nroIntentos =
          1 + Math.random() > 0.7 ? (Math.random() > 0.9 ? 2 : 1) : 0;

        for (let intentoActual = 1; intentoActual <= nroIntentos; intentoActual++) {
          const nota =
            nroIntentos === intentoActual
              ? roundTo(Math.random() * 3 + 4, 2)
              : roundTo(Math.random() * 3 + 1, 2);

          cursacionesQueries.push({
            idCursacion: cursacionId,
            agnio: estudiante.agnioIngreso + Math.floor(cursacionId / 12) + intentoActual - 1,
            notaFinal: nota,
            grupo: Math.random() > 0.5 ? 'A' : 'B',
            numIntento: intentoActual,
            semestreRelativo: Math.floor(cursacionId / 6) + 1,

            idPlan: asignaturaCursada.idPlan,
            idAsignatura: asignaturaCursada.idAsignatura,
            idEstudiante: estudiante.idEstudiante,
          });

          cursacionId++;
        }
      }
    }
  }

  const cursacionesInsertadas = await prisma.cursacion.createManyAndReturn({
    data: cursacionesQueries,
    skipDuplicates: true,
    include: {
      Asignatura: true,
      Estudiante: true,
    },
  });

  moreLog(cursacionesInsertadas);

  console.timeEnd('CURSACIONES SEEDING');

  // =============================
  // END
  // =============================
  console.time('END SEEDING');

  const endsInsertadas = await prisma.eND.createManyAndReturn({
    data: constants.ENDS,
    skipDuplicates: true,
  });

  moreLog(endsInsertadas);

  // =============================
  // RESULTADOS END
  // =============================
  const ENDS = await prisma.eND.findMany();
  const resultadosENDQueries: ResultadoEND[] = [];

  for (const end of ENDS) {
    for (const estudiante of estudiantes) {
      const resultado_estudiante: constants.FORMATO_RESPUESTA = {
        tematicas: {
          t1: {
            e1: new constants.Porcentaje(Math.random()).valor,
            e2: new constants.Porcentaje(Math.random()).valor,
          },
          t2: {
            e3: new constants.Porcentaje(Math.random()).valor,
            e4: new constants.Porcentaje(Math.random()).valor,
            e5: new constants.Porcentaje(Math.random()).valor,
            e6: new constants.Porcentaje(Math.random()).valor,
            e7: new constants.Porcentaje(Math.random()).valor,
            e8: new constants.Porcentaje(Math.random()).valor,
          },
          t3: {
            e10: new constants.Porcentaje(Math.random()).valor,
          },
        },
        preguntas_abiertas: {
          pa1: { nivel_alcanzado: constants.getRandomEnumValue(constants.Nivel_PA) },
          pa2: { nivel_alcanzado: constants.getRandomEnumValue(constants.Nivel_PA) },
          pa3: { nivel_alcanzado: constants.getRandomEnumValue(constants.Nivel_PA) },
          pa4: { nivel_alcanzado: constants.getRandomEnumValue(constants.Nivel_PA) },
          pa5: { nivel_alcanzado: constants.getRandomEnumValue(constants.Nivel_PA) },
        },
      };

      resultadosENDQueries.push({
        resultados: resultado_estudiante,
        idEND: end.idEND,
        idEstudiante: estudiante.idEstudiante,
      });
    }
  }

  await prisma.resultadoEND.createMany({
    data: resultadosENDQueries,
    skipDuplicates: true,
  });

  const resultados = await prisma.resultadoEND.findMany();
  moreLog(resultados);

  console.timeEnd('END SEEDING');

  // =============================
  // PRACTICAS (ARREGLADO COMPLETO)
  // =============================
  console.info('Se comienza el seeding de Prácticas');
  console.time('PRACTICA SEEDING');

  await prisma.modalidad.createMany({
    data: constants.MODALIDADES,
    skipDuplicates: true,
  });

  const modalidades = await prisma.modalidad.findMany();
  moreLog(modalidades);

  await prisma.convenio.createMany({
    data: constants.CONVENIOS,
    skipDuplicates: true,
  });

  const conveniosInsertados = await prisma.convenio.findMany();
  moreLog(conveniosInsertados);

  const cursacionesPracticas = await prisma.cursacion.findMany({
    include: { Asignatura: true },
  });

  const cursacionesSoloPracticas = cursacionesPracticas.filter(
    (c) => c.Asignatura.caracter === 'PRACTICA',
  );

  const practicasTomadasQueries: any[] = [];

  const date0 = new Date(2016, 1, 1);
  const date1 = new Date('2020-01-01');
  const date2 = new Date(2024, 11, 31);

  for (const c of cursacionesSoloPracticas) {
    const fechaInicio =
      c.notaFinal < 4.0 ? randomDate(date0, date1) : randomDate(date1, date2);

    practicasTomadasQueries.push({
      fechaInicio,
      resultadoDiagnostico: {},
      resultado: c.notaFinal >= 4.0 ? 'APROBADO' : 'DESAPROBADO',
      idPlan: c.idPlan,
      idAsignatura: c.idAsignatura,
      idEstudiante: c.idEstudiante,
      idCursacion: c.idCursacion,
    });
  }

  await prisma.practicaTomada.createMany({
    data: practicasTomadasQueries,
    skipDuplicates: true,
  });

  const practicasTomadas = await prisma.practicaTomada.findMany();
  moreLog(practicasTomadas);

  // PTCONVENIO
  console.time('PTCONVENIO SEEDING');

  const convenios = await prisma.convenio.findMany();
  const PTConveniosQueries: any[] = [];

  for (const practica of practicasTomadas) {
    const nroConvenios = Math.ceil(Math.random() * 2);
    const conveniosSeleccionados: UniqueStack<any> = new UniqueStack();

    while (conveniosSeleccionados.length() < nroConvenios) {
      conveniosSeleccionados.push(constants.getRandomElement(convenios));
    }

    for (const convenio of conveniosSeleccionados) {
      PTConveniosQueries.push({
        nivel: constants.getRandomEnumValue(NIVEL),

        idPlan: practica.idPlan,
        idAsignatura: practica.idAsignatura,
        idEstudiante: practica.idEstudiante,
        idCursacion: practica.idCursacion,

        idConvenio: convenio.idConvenio,
      });
    }
  }

  await prisma.pTConvenio.createMany({
    data: PTConveniosQueries,
    skipDuplicates: true,
  });

  const PTConvenios = await prisma.pTConvenio.findMany();
  moreLog(PTConvenios);

  console.timeEnd('PTCONVENIO SEEDING');

  console.timeEnd('PRACTICA SEEDING');
  console.info('El seeding de prácticas terminó');

  // =============================
  // USUARIOS
  // =============================
  console.time('Crear Usuarios');

  const usuariosQueries: any[] = [];

  for (const user of constants.USUARIOS) {
    const hashedPassword = await argon.hash(user.hashedPassword);

    usuariosQueries.push({
      ...user,
      hashedPassword,
    });
  }

  await prisma.usuario.createMany({
    data: usuariosQueries,
    skipDuplicates: true,
  });

  const usuarios = await prisma.usuario.findMany();
  moreLog(usuarios);

  console.timeEnd('Crear Usuarios');

  console.log('✅ termino todo');
}

// =============================
// HELPERS
// =============================

const moreLog = function (obj: any): void {
  console.log(util.inspect(obj, true, null, true));
};

const roundTo = function (num: number, places: number) {
  const factor = 10 ** places;
  return Math.round(num * factor) / factor;
};

const randomDate = function (start: Date, end: Date): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = Math.random() * (endTime - startTime) + startTime;
  return new Date(randomTime);
};

class UniqueStack<T> implements Iterable<T> {
  public stack: T[] = [];

  public push(item: T) {
    if (this.stack.includes(item)) return;
    this.stack.push(item);
  }

  public pop() {
    return this.stack.pop();
  }

  public length() {
    return this.stack.length;
  }

  public [Symbol.iterator]() {
    return {
      next: function () {
        return {
          done: this.stack.length === 0,
          value: this.stack.pop(),
        };
      }.bind(this),
    };
  }
}

function calcularNroAsignaturasCursadas(
  agnioIngreso: number,
  asignaturasPorPlan: number,
  agnioActual: number = 2024,
): number {
  const agniosEnCarrera = agnioActual - agnioIngreso;

  if (agniosEnCarrera >= 5) {
    return asignaturasPorPlan;
  }

  const porcentajeCursado = (agniosEnCarrera - 1) / 5 + (1 / 5) * Math.random();

  return Math.ceil(porcentajeCursado * asignaturasPorPlan);
}

// =============================
// RUN
// =============================

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
