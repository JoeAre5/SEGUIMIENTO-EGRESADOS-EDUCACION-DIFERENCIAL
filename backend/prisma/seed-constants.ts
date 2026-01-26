
import {
  Asignatura,
  Convenio,
  END,
  Estudiante,
  LineaAsignatura,
  Modalidad,
  Plan,
  Prisma,
} from '@prisma/client';

// prettier-ignore
const nombresFemeninos = [
  "Sofía", "Isabella", "Valentina", "Camila", "Valeria", "Mariana", "Daniela", "Victoria", "Martina", "Emma",
  "Lucía", "Regina", "Gabriela", "Sara", "María", "Paula", "Laura", "Julia", "Clara", "Renata",
  "Ana", "Mía", "Elena", "Luna", "Carla", "Andrea", "Olivia", "Diana", "Alba", "Aitana",
  "Bianca", "Alejandra", "Eva", "Adriana", "Natalia", "Ángela", "Lía", "Catalina", "Julieta", "Rocío",
  "Irene", "Amelia", "Pilar", "Teresa", "Cristina", "Carmen", "Noa", "Arlet", "Claudia", "Carolina",
  "Marta", "Antonia", "Milagros", "Ariadna", "Esther", "Elsa", "Samantha", "Inés", "Lorena", "Marisol",
  "Jimena", "Liliana", "Eugenia", "Paloma", "Alicia", "Manuela", "Fernanda", "Violeta", "Sabrina", "Tatiana",
  "Priscila", "Brenda", "Fátima", "Silvia", "Blanca", "Miranda", "Lourdes", "Soledad", "Rafaela", "Margarita",
  "Beatriz", "Norma", "Ivanna", "Valery", "Ámbar", "Victoria", "Itzel", "Lilia", "Bárbara", "Angélica",
  "Patricia", "Esperanza", "Estefanía", "Florencia", "Celia", "Leticia", "Guadalupe", "Paulina", "Zoe", "Maite"
];

// prettier-ignore
const nombresMasculinos = [
  "Sebastián", "Santiago", "Mateo", "Lucas", "Matías", "Diego", "Liam", "Benjamín", "Gabriel", "Daniel",
  "Alejandro", "Samuel", "Martín", "David", "Joaquín", "Adrián", "Nicolás", "Leo", "Emiliano", "Dylan",
  "Javier", "Ángel", "Antonio", "Maximiliano", "Iván", "Thiago", "Juan", "Isaac", "Pablo", "Cristian",
  "Óscar", "Leonardo", "Hugo", "Tomás", "Simón", "Carlos", "Raúl", "Mario", "Bruno", "Miguel",
  "Andrés", "Álvaro", "Ignacio", "Luis", "Esteban", "Ramón", "Darío", "Víctor", "Alan", "Felipe",
  "Julián", "Eduardo", "Manuel", "Héctor", "Roberto", "César", "Rafael", "Pedro", "Ernesto", "Marco",
  "Guillermo", "Adolfo", "Alfredo", "Arturo", "Jorge", "Rodolfo", "Enrique", "Sergio", "Ismael", "Fernando",
  "Francisco", "Anselmo", "Germán", "Salvador", "Óliver", "Marcos", "Diego", "Rúben", "Ezequiel", "Facundo",
  "Gaspar", "Ricardo", "Lucas", "Mauricio", "Gustavo", "Clemente", "Néstor", "Teodoro", "Bautista", "Esteban",
  "Vicente", "Jacobo", "Isidro", "Bernardo", "Emilio", "Rodrigo", "Eduardo", "Cristóbal", "Leandro", "Fabián"
];

// prettier-ignore
const apellidos = [
  "González", "Rodríguez", "Martínez", "Hernández", "López", "Pérez", "Sánchez", "Ramírez", "Cruz", "Torres",
  "Gómez", "Flores", "Vázquez", "Jiménez", "Díaz", "Mendoza", "Morales", "Álvarez", "Ortiz", "Gutiérrez",
  "Silva", "Castillo", "Romero", "Santos", "Ramos", "Ruiz", "Chávez", "Acosta", "Delgado", "Molina",
  "Castro", "Fernández", "Salazar", "Cabrera", "Rivas", "Montes", "Espinoza", "Cortés", "Vega", "Pineda",
  "Reyes", "Carrillo", "Ibarra", "Peña", "Aguilar", "Navarro", "Herrera", "Campos", "León", "Hidalgo",
  "Muñoz", "Rosales", "Valdez", "Esquivel", "Serrano", "Tapia", "Solís", "Villanueva", "Mejía", "Quintana",
  "Núñez", "Rojas", "Pacheco", "Padilla", "Rivera", "Orozco", "Castañeda", "Valencia", "Medina", "Vargas",
  "Soto", "Domínguez", "Palacios", "Escobar", "Bravo", "Guzmán", "Moreno", "Arévalo", "Márquez", "Cárdenas",
  "Beltrán", "Carvajal", "Bustamante", "Carranza", "Montoya", "Villalobos", "Cuevas", "Ávila", "Robles", "Zavala",
  "Peralta", "Cisneros", "Cordero", "Huerta", "Urrutia", "Luna", "Pinedo", "Velázquez", "Villegas", "Paredes",
  "Coronado", "Escalante", "Miranda", "Cano", "Bravo", "Olivares", "Figueroa", "Salinas", "Macías", "Quiroz",
  "Trujillo", "Maldonado", "Galindo", "Zúñiga", "Arriaga", "Calderón", "Cervantes", "Osorio", "Granados", "Barajas",
  "Trejo", "Camacho", "Sandoval", "Salcedo", "Alvarado", "Villaseñor", "Durán", "Estrada", "Aguirre", "Lara",
  "Benítez", "Aranda", "Sepúlveda", "Liceaga", "Cedillo", "Lozano", "Manrique", "Tirado", "Villagrán", "Carpio",
  "Meléndez", "Reynoso", "Piña", "Santana", "Ponce", "Arellano", "Tovar", "Garibay", "Alonso", "Soria",
  "Ibáñez", "Medrano", "Barrios", "Landa", "Franco", "Espinosa", "Quijano", "Cuéllar", "Zarate", "Barragán",
  "Villafuerte", "Aguilera", "Barrón", "Cardozo", "Rentería", "Montalvo", "Varela", "Montemayor", "Tapia", "Liceaga",
  "Garrido", "Arenas", "Baeza", "Pérez-Rojas", "Leiva", "Saavedra", "Zamudio", "Bustillos", "Obregón", "Batista",
  "Plascencia", "Hinojosa", "Tamez", "Carranza", "Treviño", "Suárez", "Valero", "Pizarro", "Larios", "Bello",
  "Casillas", "Castañeda", "Macías", "Hurtado", "Amador", "Olmedo", "Galarza", "Lumbreras", "Ávila", "Briones",
  "Chapa", "Ugalde", "Villaseca", "Villagómez", "Echeverría", "Zamarripa", "Barrientos", "Villalpando", "Reséndiz", "Alarcón"
];

// Arreglo de años desde 2012 hasta 2024
const años = Array.from({ length: 7 }, (_, index) => 2015 + index);

// Función para generar estudiantes aleatorios con dos nombres y dos apellidos
enum SEXO {
  M,
  F,
}

export function generarEstudiantes(
  cantidad,
  planes: Plan['idPlan'][],
): Estudiante[] {
  const estudiantes = [];
  const nroPlanes = planes.length;

  for (let i = 1; i <= cantidad; i++) {
    const sexo = Math.random() > 0.5 ? SEXO.F : SEXO.M;

    let nombre1;
    let nombre2;

    if (sexo === SEXO.M) {
      nombre1 =
        nombresMasculinos[Math.floor(Math.random() * nombresMasculinos.length)];
      nombre2 =
        nombresMasculinos[Math.floor(Math.random() * nombresMasculinos.length)];
    } else {
      nombre1 =
        nombresFemeninos[Math.floor(Math.random() * nombresFemeninos.length)];
      nombre2 =
        nombresFemeninos[Math.floor(Math.random() * nombresFemeninos.length)];
    }

    const apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)];
    const apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)];

    const nro_rut = 10_000_000 + i;
    const nro_rut_formateado = formatearNumeroConSeparador(nro_rut, '.');

    const digito_verificador = i % 11 == 10 ? 0 : i % 11 == 0 ? 'k' : i % 11;

    const rut = `${nro_rut_formateado}-${digito_verificador}`;

    // const rut = `21.${i}${i}${i}.${i}${i}${i}-1`;

    const añoIngreso = años[Math.floor(Math.random() * años.length)];
    const nombreCompleto = `${nombre1} ${nombre2} ${apellido1} ${apellido2}`;

    const estudiante = {
      idEstudiante: i,
      rut: rut,
      nombreCompleto: nombreCompleto,
      nombreSocial: nombreCompleto,
      agnioIngreso: añoIngreso,
      idPlan: planes[i % nroPlanes],
    } as Estudiante;

    estudiantes.push(estudiante);
  }
  return estudiantes;
}

function formatearNumeroConSeparador(numero, separador) {
  // Convertir el número a string
  const numeroString = numero.toString();

  // Separar parte entera de parte decimal (si existe)
  const partes = numeroString.split('.');
  let parteEntera = partes[0];
  const parteDecimal = partes.length > 1 ? '.' + partes[1] : '';

  // Aplicar separadores de miles
  parteEntera = parteEntera.replace(/\B(?=(\d{3})+(?!\d))/g, separador);

  // Concatenar parte entera y parte decimal
  return parteEntera + parteDecimal;
}

export const ASIGNATURAS: Asignatura[] = [
  // TODO NO ESTAN LOS CARACTERES BIEN PUESTOS, REVISAR DONDE SACARLOS
  // semestre: 1
  {
    idAsignatura: 1,
    codigo: 'DE119',
    nombre: 'Expresión oral y escrita I',
    nombreCorto: 'ExprOralEscrI',
    unidad: 'Departamento de Español',
    caracter: 'NORMAL',
    areaFormacion: 'FG',
    creditos: 4,
    tributaciones: [7],
    prerrequisitos: [],
    posicion: 1,
    semestre: 1,
    competencias: [
      'Comunicar ideas de forma clara y efectiva',
      'Escribir textos académicos',
      'Desarrollar habilidades de expresión oral',
    ],
    descripcion: 'Primera parte del curso de comunicación efectiva',
    linkSyllabus: 'https://ejemplo.com/syllabus-de119',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 2,
    codigo: 'ED756',
    nombre: 'Fundamentos de la filosofía en educación',
    nombreCorto: 'FundFilosEduc',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FB',
    creditos: 4,
    tributaciones: [8],
    prerrequisitos: [],
    posicion: 2,
    semestre: 1,
    competencias: [
      'Analizar fundamentos filosóficos aplicados a la educación',
      'Evaluar teorías filosóficas en el contexto educativo',
    ],
    descripcion:
      'Estudio introductorio de los fundamentos filosóficos en educación',
    linkSyllabus: 'https://ejemplo.com/syllabus-ed756',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 3,
    codigo: 'ED555',
    nombre: 'Identidad profesional y comunicación',
    nombreCorto: 'IdenProfCom',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FP',
    creditos: 4,
    tributaciones: [9],
    prerrequisitos: [],
    posicion: 3,
    semestre: 1,
    competencias: [
      'Reflexionar sobre la identidad profesional en educación',
      'Mejorar habilidades de comunicación en el ámbito profesional',
    ],
    descripcion:
      'Exploración de la identidad profesional y su relación con la comunicación',
    linkSyllabus: 'https://ejemplo.com/syllabus-ed555',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 4,
    codigo: 'ED757',
    nombre: 'Bases psicobiológicas del desarrollo humano',
    nombreCorto: 'BasesPsicoDesarHum',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FB',
    creditos: 2,
    tributaciones: [12, 17],
    prerrequisitos: [],
    posicion: 4,
    semestre: 1,
    competencias: [
      'Comprender las bases psicobiológicas del desarrollo humano',
      'Analizar factores biológicos en el desarrollo humano',
    ],
    descripcion:
      'Estudio de las bases psicobiológicas que influyen en el desarrollo humano',
    linkSyllabus: 'https://ejemplo.com/syllabus-ed757',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 5,
    codigo: 'ED838',
    nombre: 'Educación inclusiva y su contexto',
    nombreCorto: 'EducInclusiva',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FB',
    creditos: 4,
    tributaciones: [],
    prerrequisitos: [],
    posicion: 5,
    semestre: 1,
    competencias: [
      'Promover prácticas educativas inclusivas',
      'Analizar el contexto socioeducativo de la educación inclusiva',
    ],
    descripcion:
      'Estudio de los principios y prácticas de la educación inclusiva',
    linkSyllabus: 'https://ejemplo.com/syllabus-ed838',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 6,
    codigo: 'ED895',
    nombre: 'Fundamentos sociológicos en educación',
    nombreCorto: 'FundSocioEduc',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FB',
    creditos: 4,
    tributaciones: [11],
    prerrequisitos: [],
    posicion: 6,
    semestre: 1,
    competencias: [
      'Analizar fundamentos sociológicos aplicados a la educación',
      'Evaluar teorías sociológicas en el ámbito educativo',
    ],
    descripcion:
      'Estudio introductorio de los fundamentos sociológicos en educación',
    linkSyllabus: 'https://ejemplo.com/syllabus-ed895',
    idPlan: null,
    idLinea: null,
  },

  // semestre: 2
  {
    idAsignatura: 7,
    codigo: 'DE126',
    nombre: 'Expresión oral y escrita II',
    nombreCorto: 'ExprOralEscrII',
    unidad: 'Departamento de Español',
    caracter: 'NORMAL',
    areaFormacion: 'FG',
    creditos: 4,
    tributaciones: [13],
    prerrequisitos: [1],
    posicion: 7,
    semestre: 2,
    competencias: [
      'Desarrollar habilidades avanzadas de expresión oral y escrita',
      'Analizar textos académicos complejos',
    ],
    descripcion: 'Continuación del curso de Expresión oral y escrita I',
    linkSyllabus: 'https://ejemplo.com/syllabus-de126',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 8,
    codigo: 'ED896',
    nombre: 'Enfoque sistémico y psicopedagógico',
    nombreCorto: 'EnfSistPsico',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FB',
    creditos: 6,
    tributaciones: [],
    prerrequisitos: [2],
    posicion: 8,
    semestre: 2,
    competencias: [
      'Aplicar enfoques sistémicos en contextos psicopedagógicos',
      'Evaluar intervenciones psicopedagógicas desde una perspectiva sistémica',
    ],
    descripcion: 'Estudio avanzado de enfoques sistémicos y psicopedagógicos',
    linkSyllabus: 'https://ejemplo.com/syllabus-ed896',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 9,
    codigo: 'ED559',
    nombre: 'El alumno y su entorno social',
    nombreCorto: 'AlumnoEntornoSoc',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FP',
    creditos: 4,
    tributaciones: [14],
    prerrequisitos: [3],
    posicion: 9,
    semestre: 2,
    competencias: [
      'Analizar el impacto del entorno social en el desarrollo educativo',
      'Promover la integración social en contextos educativos',
    ],
    descripcion: 'Estudio del alumno en relación con su entorno social',
    linkSyllabus: 'https://ejemplo.com/syllabus-ed559',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 10,
    codigo: 'KN003',
    nombre: 'Salud alimentaria',
    nombreCorto: 'SaludAlimentaria',
    unidad: 'Departamento de Kinesiología y Nutrición',
    caracter: 'NORMAL',
    areaFormacion: 'FB',
    creditos: 5,
    tributaciones: [18],
    prerrequisitos: [],
    posicion: 10,
    semestre: 2,
    competencias: [
      'Promover prácticas saludables de alimentación',
      'Evaluar el impacto de la nutrición en la salud',
    ],
    descripcion:
      'Estudio de la relación entre alimentación y salud desde una perspectiva profesional',
    linkSyllabus: 'https://ejemplo.com/syllabus-KN003',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 11,
    codigo: 'ED897',
    nombre: 'Política y marco jurídico',
    nombreCorto: 'PoliticaMarcoJur',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FG',
    creditos: 6,
    tributaciones: [26],
    prerrequisitos: [6],
    posicion: 11,
    semestre: 2,
    competencias: [
      'Analizar políticas educativas y su marco jurídico',
      'Evaluar impactos legales en contextos educativos',
    ],
    descripcion:
      'Estudio de políticas y marco jurídico aplicados a la educación',
    linkSyllabus: 'https://ejemplo.com/syllabus-ed897',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 12,
    codigo: 'ED898',
    nombre: 'Fundamentos teóricos del aprendizaje',
    nombreCorto: 'FundTeorAprend',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FB',
    creditos: 6,
    tributaciones: [16],
    prerrequisitos: [4],
    posicion: 12,
    semestre: 2,
    competencias: [
      'Comprender teorías fundamentales del aprendizaje',
      'Aplicar teorías del aprendizaje en contextos educativos',
    ],
    descripcion: 'Estudio profundo de los fundamentos teóricos del aprendizaje',
    linkSyllabus: 'https://ejemplo.com/syllabus-ed898',
    idPlan: null,
    idLinea: null,
  },

  // semestre: 3
  {
    idAsignatura: 13,
    codigo: 'DE127',
    nombre: 'Lingüística',
    nombreCorto: 'Linguistica',
    unidad: 'Departamento de Español',
    caracter: 'NORMAL',
    areaFormacion: 'FB',
    creditos: 5,
    tributaciones: [19],
    prerrequisitos: [7], // Prerrequisito: Expresión oral y escrita II (DE126)
    posicion: 13,
    semestre: 3,
    competencias: [
      'Analizar principios y teorías lingüísticas',
      'Aplicar conceptos lingüísticos en contextos académicos',
    ],
    descripcion: 'Estudio avanzado de la lingüística en el contexto académico',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 14,
    codigo: 'ED564',
    nombre: 'Aprendizaje profundo y docencia de calidad',
    nombreCorto: 'AprendProfDoc',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FP',
    creditos: 4,
    tributaciones: [],
    prerrequisitos: [9], // Prerrequisito: El alumno y su entorno social (ED559)
    posicion: 14,
    semestre: 3,
    competencias: [
      'Implementar estrategias de aprendizaje profundo',
      'Evaluar la calidad docente desde enfoques innovadores',
    ],
    descripcion:
      'Estudio del aprendizaje profundo y su aplicación en la docencia',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 15,
    codigo: 'ED710',
    nombre: 'Liderazgo y colaboración pedagógica',
    nombreCorto: 'LiderCollabPed',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FP',
    creditos: 4,
    tributaciones: [21, 24],
    prerrequisitos: [],
    posicion: 15,
    semestre: 3,
    competencias: [
      'Desarrollar habilidades de liderazgo en contextos educativos',
      'Promover la colaboración pedagógica efectiva',
    ],
    descripcion:
      'Estudio del liderazgo y la colaboración en el ámbito educativo',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 16,
    codigo: 'ED899',
    nombre: 'Currículo en contexto psicopedagógico',
    nombreCorto: 'CurriculoPsico',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FP',
    creditos: 6,
    tributaciones: [20, 24, 33],
    prerrequisitos: [12], // Prerrequisito: Fundamentos teóricos del aprendizaje (ED898)
    posicion: 16,
    semestre: 3,
    competencias: [
      'Diseñar currículos adaptados a contextos psicopedagógicos',
      'Evaluar impactos curriculares desde enfoques teóricos del aprendizaje',
    ],
    descripcion:
      'Estudio del currículo educativo en contextos psicopedagógicos',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 17,
    codigo: 'ED900',
    nombre: 'Neurociencias I aplicada a la educación diferencial',
    nombreCorto: 'NeurocienciasEducDif',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FE',
    creditos: 6,
    tributaciones: [22],
    prerrequisitos: [4], // Prerrequisito: Bases psicobiológicas del desarrollo humano (ED757)
    posicion: 17,
    semestre: 3,
    competencias: [
      'Aplicar neurociencias en contextos educativos diferenciales',
      'Evaluar intervenciones educativas basadas en neurociencias',
    ],
    descripcion:
      'Estudio de neurociencias aplicadas a la educación diferencial',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 18,
    codigo: 'EF018',
    nombre: 'Introducción a la psicomotricidad',
    nombreCorto: 'IntroPsicomotricidad',
    unidad: 'Departamento de Ciencias de la Actividad Física y del Deporte',
    caracter: 'NORMAL',
    areaFormacion: 'FB',
    creditos: 5,
    tributaciones: [23],
    prerrequisitos: [10], // Prerrequisito: Salud alimentaria (KN003)
    posicion: 18,
    semestre: 3,
    competencias: [
      'Aplicar principios de psicomotricidad en contextos de actividad física',
      'Evaluar desarrollo psicomotor en poblaciones diversas',
    ],
    descripcion:
      'Estudio introductorio a la psicomotricidad y su aplicación en la actividad física',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },

  // semestre: 4
  {
    idAsignatura: 19,
    codigo: 'DE128',
    nombre: 'Psicolingüística',
    nombreCorto: 'Psicolinguistica',
    unidad: 'Departamento de Español',
    caracter: 'NORMAL',
    areaFormacion: 'FE',
    creditos: 5,
    tributaciones: [25, 28],
    prerrequisitos: [13], // Prerrequisito: Lingüística (DE127)
    posicion: 19,
    semestre: 4,
    competencias: [
      'Analizar procesos psicolingüísticos en contextos educativos',
      'Aplicar teorías psicolingüísticas en la práctica profesional',
    ],
    descripcion:
      'Estudio avanzado de la psicolingüística en el ámbito educativo',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 20,
    codigo: 'ED568',
    nombre: 'Planificación y sus fundamentos',
    nombreCorto: 'PlanificacionFund',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FE',
    creditos: 5,
    tributaciones: [27],
    prerrequisitos: [16], // Prerrequisito: Currículo en contexto psicopedagógico (ED899)
    posicion: 20,
    semestre: 4,
    competencias: [
      'Diseñar planes educativos fundamentados en teorías contemporáneas',
      'Evaluar la efectividad de estrategias de planificación educativa',
    ],
    descripcion:
      'Estudio de la planificación educativa y sus fundamentos teóricos',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 21,
    codigo: 'ED693',
    nombre: 'Orientación, mediación y jefatura de curso',
    nombreCorto: 'OrientacionMediacion',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FP',
    creditos: 3,
    tributaciones: [29],
    prerrequisitos: [15], // Prerrequisito: Liderazgo y colaboración pedagógica (ED710)
    posicion: 21,
    semestre: 4,
    competencias: [
      'Aplicar técnicas de orientación y mediación en contextos educativos',
      'Desarrollar habilidades de jefatura de curso efectiva',
    ],
    descripcion:
      'Estudio de la orientación, mediación y liderazgo en el ámbito educativo',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 22,
    codigo: 'ED905',
    nombre: 'Neurociencias II aplicada a la educación diferencial',
    nombreCorto: 'NeurocienciasEducDifII',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FE',
    creditos: 5,
    tributaciones: [51],
    prerrequisitos: [17], // Prerrequisito: Neurociencias I aplicada a la educación diferencial (ED900)
    posicion: 22,
    semestre: 4,
    competencias: [
      'Aplicar avances en neurociencias a la educación diferencial',
      'Evaluar intervenciones educativas basadas en neurociencias avanzadas',
    ],
    descripcion:
      'Estudio avanzado de neurociencias aplicadas a la educación diferencial',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 23,
    codigo: 'KN004',
    nombre: 'Psicomotricidad en educación diferencial',
    nombreCorto: 'PsicomotricidadEducDif',
    unidad: 'Departamento de Kinesiología y Nutrición',
    caracter: 'NORMAL',
    areaFormacion: 'FE',
    creditos: 6,
    tributaciones: [],
    prerrequisitos: [18], // Prerrequisito: Introducción a la psicomotricidad (EF018)
    posicion: 23,
    semestre: 4,
    competencias: [
      'Implementar programas de psicomotricidad en contextos educativos diferenciales',
      'Evaluar el desarrollo psicomotor en poblaciones con necesidades especiales',
    ],
    descripcion:
      'Estudio avanzado de la psicomotricidad y su aplicación en la educación diferencial',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 24,
    codigo: 'ED906',
    nombre: 'Práctica I',
    nombreCorto: 'PracticaI',
    unidad: 'Departamento de Educación',
    caracter: 'PRACTICA',
    areaFormacion: 'FP',
    creditos: 6,
    tributaciones: [30],
    prerrequisitos: [15, 16], // Prerrequisitos: Liderazgo y colaboración pedagógica (ED710) y Currículo en contexto psicopedagógico (ED899)
    posicion: 24,
    semestre: 4,
    competencias: [
      'Aplicar conocimientos teóricos en contextos prácticos de enseñanza',
      'Desarrollar habilidades pedagógicas bajo supervisión docente',
    ],
    descripcion: 'Práctica supervisada en ambientes educativos',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },

  // semestre: 5
  {
    idAsignatura: 25,
    codigo: 'ED907',
    nombre: 'Patologías del lenguaje',
    nombreCorto: 'PatologiasLenguaje',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FE',
    creditos: 4,
    tributaciones: [31],
    prerrequisitos: [19], // Prerrequisito: Psicolingüística (DE128)
    posicion: 25,
    semestre: 5,
    competencias: [
      'Diagnosticar y tratar patologías del lenguaje en contextos educativos',
      'Implementar estrategias de intervención para trastornos del lenguaje',
    ],
    descripcion:
      'Estudio de las patologías del lenguaje en el ámbito educativo',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 26,
    codigo: 'ED919',
    nombre: 'Trastornos del aprendizaje',
    nombreCorto: 'TrastornosAprendizaje',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FE',
    creditos: 4,
    tributaciones: [35],
    prerrequisitos: [11], // Prerrequisito: Política y marco jurídico (ED897)
    posicion: 26,
    semestre: 5,
    competencias: [
      'Identificar y abordar trastornos del aprendizaje en contextos educativos',
      'Desarrollar estrategias educativas inclusivas para estudiantes con trastornos',
    ],
    descripcion:
      'Estudio de los trastornos del aprendizaje y su impacto en la educación',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 27,
    codigo: 'ED694',
    nombre: 'Evaluación educativa',
    nombreCorto: 'EvaluacionEducativa',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FP',
    creditos: 5,
    tributaciones: [32],
    prerrequisitos: [20], // Prerrequisito: Planificación y sus fundamentos (ED568)
    posicion: 27,
    semestre: 5,
    competencias: [
      'Diseñar y aplicar instrumentos de evaluación educativa',
      'Analizar y mejorar procesos de evaluación en contextos escolares',
    ],
    descripcion:
      'Estudio de la evaluación educativa y sus aplicaciones prácticas',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 28,
    codigo: 'ED931',
    nombre: 'Razonamiento matemático y sus patologías',
    nombreCorto: 'RazonamientoMatematico',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FE',
    creditos: 4,
    tributaciones: [31, 34],
    prerrequisitos: [19], // Prerrequisito: Psicolingüística (DE128)
    posicion: 28,
    semestre: 5,
    competencias: [
      'Analizar y abordar dificultades en el razonamiento matemático',
      'Desarrollar estrategias de enseñanza para mejorar el razonamiento lógico-matemático',
    ],
    descripcion:
      'Estudio del razonamiento matemático y sus implicaciones educativas',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 29,
    codigo: 'ED932',
    nombre: 'Orientación vocacional en diversidad',
    nombreCorto: 'OrientacionVocacional',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FE',
    creditos: 4,
    tributaciones: [36, 42, 46],
    prerrequisitos: [21], // Prerrequisito: Orientación, mediación y jefatura de curso (ED693)
    posicion: 29,
    semestre: 5,
    competencias: [
      'Aplicar técnicas de orientación vocacional en contextos educativos diversos',
      'Asesorar a estudiantes en la toma de decisiones vocacionales',
    ],
    descripcion:
      'Estudio de la orientación vocacional y sus aplicaciones en la diversidad educativa',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 30,
    codigo: 'ED933',
    nombre: 'Práctica II',
    nombreCorto: 'PracticaII',
    unidad: 'Departamento de Educación',
    caracter: 'PRACTICA',
    areaFormacion: 'FP',
    creditos: 10,
    tributaciones: [39, 49],
    prerrequisitos: [24], // Prerrequisito: Práctica I (ED906)
    posicion: 30,
    semestre: 5,
    competencias: [
      'Implementar proyectos educativos autónomamente bajo supervisión docente',
      'Reflexionar críticamente sobre la práctica educativa',
    ],
    descripcion: 'Práctica profesional avanzada en contextos educativos',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },

  // semestre: 6
  {
    idAsignatura: 31,
    codigo: 'ED934',
    nombre: 'Estrategias en psicopedagogía del lenguaje',
    nombreCorto: 'EstrategiasPsicopedagogia',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FE',
    creditos: 6,
    tributaciones: [],
    prerrequisitos: [25, 28], // Prerrequisitos: Patologías del lenguaje (ED907), Razonamiento matemático y sus patologías (ED931)
    posicion: 31,
    semestre: 6,
    competencias: [
      'Desarrollar estrategias psicopedagógicas para mejorar el lenguaje en estudiantes',
      'Aplicar técnicas avanzadas en psicopedagogía del lenguaje',
    ],
    descripcion:
      'Estudio de estrategias psicopedagógicas enfocadas en el lenguaje',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 32,
    codigo: 'ED695',
    nombre: 'Investigación en la acción educativa',
    nombreCorto: 'InvestigacionEducativa',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FP',
    creditos: 5,
    tributaciones: [41, 43],
    prerrequisitos: [27], // Prerrequisito: Evaluación educativa (ED694)
    posicion: 32,
    semestre: 6,
    competencias: [
      'Realizar investigaciones aplicadas para mejorar la práctica educativa',
      'Analizar y aplicar resultados de investigación en contextos educativos',
    ],
    descripcion: 'Estudio de métodos de investigación aplicados en educación',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 33,
    codigo: 'ED935',
    nombre: 'Didáctica en educación diferencial',
    nombreCorto: 'DidacticaDiferencial',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FP',
    creditos: 6,
    tributaciones: [],
    prerrequisitos: [16], // Prerrequisito: Currículo en contexto psicopedagógico (ED899)
    posicion: 33,
    semestre: 6,
    competencias: [
      'Diseñar estrategias didácticas inclusivas para la educación diferencial',
      'Implementar modelos pedagógicos adaptados a las necesidades especiales',
    ],
    descripcion:
      'Estudio de la didáctica adaptada para la educación diferencial',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 34,
    codigo: 'ED936',
    nombre: 'Estrategias del razonamiento matemático',
    nombreCorto: 'EstrategiasRazonamiento',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FE',
    creditos: 6,
    tributaciones: [],
    prerrequisitos: [28], // Prerrequisito: Razonamiento matemático y sus patologías (ED931)
    posicion: 34,
    semestre: 6,
    competencias: [
      'Desarrollar estrategias avanzadas para mejorar el razonamiento matemático en estudiantes',
      'Aplicar técnicas psicopedagógicas específicas para el razonamiento lógico-matemático',
    ],
    descripcion:
      'Estudio de estrategias para mejorar el razonamiento matemático en contextos educativos',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 35,
    codigo: 'ED937',
    nombre: 'Diagnóstico psicopedagógico',
    nombreCorto: 'DiagnosticoPsicopedagogico',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FE',
    creditos: 6,
    tributaciones: [37, 40],
    prerrequisitos: [26], // Prerrequisito: Trastornos del aprendizaje (ED919)
    posicion: 35,
    semestre: 6,
    competencias: [
      'Realizar evaluaciones diagnósticas para identificar necesidades educativas especiales',
      'Aplicar técnicas de diagnóstico psicopedagógico en contextos educativos',
    ],
    descripcion:
      'Estudio del diagnóstico psicopedagógico y su aplicación en la práctica educativa',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },

  // semestre: 7
  {
    idAsignatura: 36,
    codigo: 'ED938',
    nombre: 'Gestión de proyecto en educación diferencial',
    nombreCorto: 'GestionProyectoEducacion',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FE',
    creditos: 4,
    tributaciones: [44],
    prerrequisitos: [29],
    posicion: 36,
    semestre: 7,
    competencias: [
      'Aplicar técnicas de gestión de proyectos adaptadas a la educación diferencial',
      'Planificar y ejecutar proyectos educativos inclusivos',
    ],
    descripcion:
      'Estudio de la gestión de proyectos específicos para la educación diferencial',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 37,
    codigo: 'ED722',
    nombre: 'Desarrollo, diagnóstico e inclusión educativa',
    nombreCorto: 'DesarrolloDiagnosticoInclusion',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FP',
    creditos: 4,
    tributaciones: [],
    prerrequisitos: [35], // Prerrequisito: Diagnóstico psicopedagógico (ED937)
    posicion: 37,
    semestre: 7,
    competencias: [
      'Desarrollar estrategias para la inclusión educativa de estudiantes con necesidades especiales',
      'Aplicar diagnósticos educativos para mejorar la inclusión en contextos escolares',
    ],
    descripcion:
      'Estudio del desarrollo y diagnóstico en la inclusión educativa',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 38,
    codigo: 'ED556',
    nombre: 'Uso de TICs en la enseñanza',
    nombreCorto: 'TICsEnsenanza',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FP',
    creditos: 4,
    tributaciones: [],
    prerrequisitos: [],
    posicion: 38,
    semestre: 7,
    competencias: [
      'Integrar tecnologías de la información y comunicación en procesos educativos',
      'Desarrollar habilidades para el uso pedagógico de herramientas tecnológicas',
    ],
    descripcion:
      'Estudio del uso educativo de las tecnologías de la información y comunicación',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 39,
    codigo: 'FP101',
    nombre: 'Detección y atención en etapa infantil',
    nombreCorto: 'DeteccionAtencionInfantil',
    unidad: 'Escuela de Psicología y Filosofía',
    caracter: 'NORMAL',
    areaFormacion: 'FP',
    creditos: 8,
    tributaciones: [45],
    prerrequisitos: [30], // Prerrequisito: Práctica II (ED933)
    posicion: 39,
    semestre: 7,
    competencias: [
      'Identificar y atender necesidades especiales en la etapa infantil',
      'Aplicar técnicas de detección y atención temprana en el desarrollo infantil',
    ],
    descripcion:
      'Estudio de la detección y atención en la etapa infantil desde la perspectiva psicológica',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 40,
    codigo: 'ED939',
    nombre: 'Evaluación y diagnóstico psicopedagógico',
    nombreCorto: 'EvaluacionDiagnosticoPsicopedagogico',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FE',
    creditos: 6,
    tributaciones: [],
    prerrequisitos: [35], // Prerrequisito: Diagnóstico psicopedagógico (ED937)
    posicion: 40,
    semestre: 7,
    competencias: [
      'Realizar evaluaciones y diagnósticos psicopedagógicos en contextos educativos',
      'Aplicar técnicas de evaluación adaptadas a la diversidad educativa',
    ],
    descripcion:
      'Estudio de técnicas y herramientas para la evaluación psicopedagógica',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 41,
    codigo: 'DI183',
    nombre: 'Inglés comprensión lectora I',
    nombreCorto: 'InglesComprensionLectora',
    unidad: 'Departamento de Idiomas Extranjeros',
    caracter: 'NORMAL',
    areaFormacion: 'FG',
    creditos: 5,
    tributaciones: [47],
    prerrequisitos: [32], // Prerrequisito: Investigación en la acción educativa (ED695)
    posicion: 41,
    semestre: 7,
    competencias: [
      'Desarrollar habilidades de comprensión lectora en inglés',
      'Aplicar técnicas de lectura crítica en contextos académicos en inglés',
    ],
    descripcion: 'Estudio de la comprensión lectora en el idioma inglés',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },

  // semestre: 8
  {
    idAsignatura: 42,
    codigo: 'ED941',
    nombre: 'Técnicas en atención a la familia en educación diferencial',
    nombreCorto: 'TecnicasAtencionFamilia',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FE',
    creditos: 4,
    tributaciones: [],
    prerrequisitos: [29], // Prerrequisito: Orientación vocacional en diversidad (ED932)
    posicion: 42,
    semestre: 8,
    competencias: [
      'Aplicar técnicas de atención familiar en contextos de educación diferencial',
      'Desarrollar estrategias de intervención familiar adaptadas a necesidades educativas especiales',
    ],
    descripcion:
      'Estudio de técnicas de intervención familiar en el ámbito educativo diferencial',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 43,
    codigo: 'ED708',
    nombre: 'Taller de proyecto y seminario de título',
    nombreCorto: 'TallerProyectoSeminario',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FP',
    creditos: 4,
    tributaciones: [],
    prerrequisitos: [32], // Prerrequisito: Investigación en la acción educativa (ED695)
    posicion: 43,
    semestre: 8,
    competencias: [
      'Desarrollar un proyecto de investigación o intervención educativa',
      'Presentar un seminario de título en el área de educación diferencial',
    ],
    descripcion:
      'Estudio y desarrollo de un proyecto de investigación o intervención en educación diferencial',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 44,
    codigo: 'ED709',
    nombre: 'Desarrollo organizacional y gestión de redes',
    nombreCorto: 'DesarrolloOrganizacional',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FP',
    creditos: 4,
    tributaciones: [],
    prerrequisitos: [36], // Prerrequisito: Gestión de proyecto en educación diferencial (ED938)
    posicion: 44,
    semestre: 8,
    competencias: [
      'Aplicar técnicas de desarrollo organizacional en contextos educativos',
      'Gestionar redes colaborativas en el ámbito de la educación diferencial',
    ],
    descripcion:
      'Estudio del desarrollo organizacional y gestión de redes en educación diferencial',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 45,
    codigo: 'FP102',
    nombre: 'Detección y atención en etapa adolescente',
    nombreCorto: 'DeteccionAtencionAdolescente',
    unidad: 'Escuela de Psicología y Filosofía',
    caracter: 'NORMAL',
    areaFormacion: 'FP',
    creditos: 8,
    tributaciones: [52],
    prerrequisitos: [39], // Prerrequisito: Detección y atención en etapa infantil (FP101)
    posicion: 45,
    semestre: 8,
    competencias: [
      'Identificar y atender necesidades especiales en la etapa adolescente',
      'Aplicar técnicas de detección y atención en el desarrollo adolescente',
    ],
    descripcion:
      'Estudio de la detección y atención en la etapa adolescente desde la perspectiva psicológica',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 46,
    codigo: 'DU001',
    nombre: 'Ética, moral y vocación en psicopedagogía',
    nombreCorto: 'EticaMoralVocacion',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FE',
    creditos: 4,
    tributaciones: [],
    prerrequisitos: [29], // Prerrequisito: Orientación vocacional en diversidad (ED932)
    posicion: 46,
    semestre: 8,
    competencias: [
      'Reflexionar sobre dilemas éticos en la práctica psicopedagógica',
      'Desarrollar una perspectiva ética y moral en la vocación educativa',
    ],
    descripcion:
      'Estudio de la ética, moral y vocación en el ejercicio de la psicopedagogía',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 47,
    codigo: 'DI184',
    nombre: 'Inglés comprensión lectora II',
    nombreCorto: 'InglesComprensionLectoraII',
    unidad: 'Departamento de Idiomas Extranjeros',
    caracter: 'NORMAL',
    areaFormacion: 'FG',
    creditos: 5,
    tributaciones: [],
    prerrequisitos: [41], // Prerrequisito: Inglés comprensión lectora I (DI183)
    posicion: 47,
    semestre: 8,
    competencias: [
      'Desarrollar habilidades avanzadas de comprensión lectora en inglés',
      'Analizar textos académicos y literarios en inglés',
    ],
    descripcion:
      'Estudio avanzado de la comprensión lectora en el idioma inglés',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },

  // semestre: 9
  {
    idAsignatura: 48,
    codigo: 'YY104',
    nombre: 'E.F.P. 1',
    nombreCorto: 'EFP1',
    unidad: 'Departamento de Educación',
    caracter: 'ELECTIVO',
    areaFormacion: 'FP',
    creditos: 5,
    tributaciones: [],
    prerrequisitos: [],
    posicion: 48,
    semestre: 9,
    competencias: [],
    descripcion: '',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 49,
    codigo: 'DU002',
    nombre: 'Estrategias plásticas en educación diferencial',
    nombreCorto: 'EstrategiasPlasticas',
    unidad: 'Departamento de Educación',
    caracter: 'NORMAL',
    areaFormacion: 'FE',
    creditos: 5,
    tributaciones: [],
    prerrequisitos: [30], // Prerrequisito: Práctica II (ED933)
    posicion: 49,
    semestre: 9,
    competencias: [
      'Aplicar técnicas plásticas en contextos educativos diferenciados',
      'Fomentar la creatividad y expresión artística en estudiantes con necesidades especiales',
    ],
    descripcion:
      'Estudio de estrategias plásticas aplicadas a la educación diferencial',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 50,
    codigo: 'YY105',
    nombre: 'E.F.P. 2',
    nombreCorto: 'EFP2',
    unidad: 'Departamento de Educación',
    caracter: 'ELECTIVO',
    areaFormacion: 'FP',
    creditos: 5,
    tributaciones: [],
    prerrequisitos: [],
    posicion: 50,
    semestre: 9,
    competencias: [],
    descripcion: '',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 51,
    codigo: 'FP103',
    nombre: 'Desarrollo mental y su evolución',
    nombreCorto: 'DesarrolloMental',
    unidad: 'Escuela de Psicología y Filosofía',
    caracter: 'NORMAL',
    areaFormacion: 'FP',
    creditos: 6,
    tributaciones: [],
    prerrequisitos: [22], // Prerrequisito: Neurociencias II aplicada a la educación diferencial (ED905)
    posicion: 51,
    semestre: 9,
    competencias: [
      'Analizar el desarrollo mental desde una perspectiva evolutiva',
      'Aplicar teorías del desarrollo en contextos educativos diferenciados',
    ],
    descripcion:
      'Estudio del desarrollo mental y su evolución en el contexto educativo',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 52,
    codigo: 'DU003',
    nombre: 'Práctica III etapa infanto juvenil',
    nombreCorto: 'PracticaIII',
    unidad: 'Departamento de Educación',
    caracter: 'PRACTICA',
    areaFormacion: 'FP',
    creditos: 10,
    tributaciones: [54],
    prerrequisitos: [45], // Prerrequisito: Detección y atención en etapa adolescente (FP102)
    posicion: 52,
    semestre: 9,
    competencias: [
      'Aplicar conocimientos teórico-prácticos en contextos reales de educación diferencial',
      'Desarrollar competencias profesionales en la atención a la infancia y juventud con necesidades especiales',
    ],
    descripcion:
      'Práctica profesional supervisada en etapa infanto juvenil en educación diferencial',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },

  // semestre: 10
  {
    idAsignatura: 53,
    codigo: 'DU004',
    nombre: 'Actividad de titulación',
    nombreCorto: 'ActividadTitulacion',
    unidad: 'Departamento de Educación',
    caracter: 'TITULACION',
    areaFormacion: 'FE',
    creditos: 4,
    tributaciones: [],
    prerrequisitos: [],
    posicion: 53,
    semestre: 10,
    competencias: [
      'Realizar una actividad de titulación en el área de educación diferencial',
      'Desarrollar competencias de investigación y aplicación práctica',
    ],
    descripcion:
      'Actividad de titulación para optar al grado académico correspondiente',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
  {
    idAsignatura: 54,
    codigo: 'DU005',
    nombre: 'Práctica profesional',
    nombreCorto: 'PracticaProfesional',
    unidad: 'Departamento de Educación',
    caracter: 'PRACTICA',
    areaFormacion: 'FP',
    creditos: 25,
    tributaciones: [],
    prerrequisitos: [52], // Prerrequisito: Práctica III etapa infanto juvenil (DU003)
    posicion: 54,
    semestre: 10,
    competencias: [
      'Aplicar conocimientos y competencias en un contexto real de educación diferencial',
      'Desarrollar habilidades profesionales bajo supervisión y evaluación continua',
    ],
    descripcion:
      'Práctica profesional en educación diferencial bajo supervisión académica',
    linkSyllabus: '',
    idPlan: null,
    idLinea: null,
  },
];

export const PLANES: Plan[] = [
  {
    idPlan: 1,
    codigo: 309,
    titulo: '2018 Ingreso Regular',
    agnio: 2019,
    fechaInstauracion: new Date('2019-10-20'),
  },
  {
    idPlan: 2,
    codigo: 325,
    titulo: '2019 Ingreso Prosecusión',
    // TODO: VER PROGRAMA DEL PLAN COMO DATO API
    agnio: 2020,
    fechaInstauracion: new Date('2020-05-15'),
  },
];

// END 2024

type Estandar = {
  titulo: string;
};

type Tematica = {
  numero: number;
  nombre: string;
  estandares: {
    [key: string]: Estandar;
  };
};

type NivelPA = {
  nombre_nivel: string;
  descriptor: string;
};

type SituacionPedagogica = {
  tipo: string;
  nombre: string;
  niveles: {
    nivel_1: NivelPA;
    nivel_2: NivelPA;
    nivel_3: NivelPA;
    nivel_4: NivelPA;
  };
};

export type FORMATO_END1 = {
  tematicas: {
    [key: string]: Tematica;
  };
  preguntas_abiertas: {
    [key: string]: SituacionPedagogica;
  };
};

const formato1: FORMATO_END1 = {
  tematicas: {
    t1: {
      numero: 1,
      nombre: 'Aprendizaje y desarrollo de estudiantes de Educación Básica',
      estandares: {
        e1: {
          titulo:
            'Conoce a los estudiantes de educación básica y sabe cómo ellos aprenden',
        },
        e2: {
          titulo:
            'Está preparado para promover el desarrollo personal y social de los estudiantes',
        },
      },
    },
    t2: {
      numero: 2,
      nombre: 'Diseño e implementación de la enseñanza',
      estandares: {
        e3: {
          titulo: 'Conoce el currículo de la educación básica',
        },
        e4: {
          titulo:
            'Sabe cómo diseñar e implementar estrategias enseñanza-aprendizaje adecuadas para los objetivos de acuerdo al contexto',
        },
        e5: {
          titulo:
            'Está preparado para gestionar la clase y crear un ambiente apropiado para el aprendizaje según contextos',
        },
        e6: {
          titulo:
            'Conoce y sabe aplicar métodos de evaluación para observar el progreso de los estudiantes y usar los resultados para retroalimentar el aprendizaje y la práctica pedagógica',
        },
        e7: {
          titulo: 'Conoce cómo se genera y transforma cultura escolar',
        },
        e8: {
          titulo:
            'Está preparado para atender la diversidad y promover la integración en el aula',
        },
      },
    },
    t3: {
      numero: 3,
      nombre: 'La profesión docente y el sistema educacional chileno',
      estandares: {
        e10: {
          titulo:
            'Aprende en forma continua y reflexiona sobre su práctica y su inserción en el sistema educacional',
        },
      },
    },
  },
  preguntas_abiertas: {
    pa1: {
      tipo: 'PA_SP',
      nombre: 'Resolución de situaciones pedagógicas en Ed. Parvularia',
      niveles: {
        nivel_1: {
          nombre_nivel: 'A',
          descriptor:
            'Proponen en detalle una estrategia pedagógica basada en la situación expuesta en el caso y en una perspectiva de ambiente de aprendizaje inclusivo.',
        },
        nivel_2: {
          nombre_nivel: 'B',
          descriptor:
            'Proponen una estrategia pedagógica basada en la situación expuesta en el caso y en una perspectiva de aprendizaje inclusivo, sin embargo, no realizan una explicación detallada de la propuesta.',
        },
        nivel_3: {
          nombre_nivel: 'C',
          descriptor:
            'Proponen una estrategia pedagógica similar a la señalada en el caso o en la que no se observa claramente la perspectiva de ambiente de aprendizaje inclusivo.',
        },
        nivel_4: {
          nombre_nivel: 'D',
          descriptor:
            'Proponen una estrategia similar a la señalada en el caso o en la que no se observa la perspectiva de ambiente de aprendizaje inclusivo.',
        },
      },
    },
    pa2: {
      tipo: 'PA_SP',
      nombre: 'Resolución de situaciones pedagógicas en Ed. Básica',
      niveles: {
        nivel_1: {
          nombre_nivel: 'A',
          descriptor:
            'Proponen una forma de solucionar el conflicto surgido entre los estudiantes del caso, considerando el uso de estrategias de resolución de conflictos y normas de convivencia.',
        },
        nivel_2: {
          nombre_nivel: 'B',
          descriptor:
            'Proponen una forma de solucionar el conflicto surgido entre los estudiantes del caso, sin embargo, consideran solo el uso de estrategias de resolución de conflictos o normas de convivencia.',
        },
        nivel_3: {
          nombre_nivel: 'C',
          descriptor:
            'Describen una actividad que no se relaciona claramente con el conflicto del caso, además, consideran solo el uso de estrategias de resolución de conflictos o normas de convivencia.',
        },
        nivel_4: {
          nombre_nivel: 'D',
          descriptor:
            'Mencionan solo una actividad que no hace alusión al conflicto del caso, además, consideran solo el uso de estrategias de resolución de conflictos o normas de convivencia.',
        },
      },
    },
    pa3: {
      tipo: 'PA_SP',
      nombre: 'Resolución de situaciones pedagógicas en Ed. Diferencial',
      niveles: {
        nivel_1: {
          nombre_nivel: 'A',
          descriptor:
            'Proponen una actividad de clase en que involucra la participación de los estudiantes en la que se comunica e implementan normas de convivencia de acuerdo con la información proporcionada en el caso.',
        },
        nivel_2: {
          nombre_nivel: 'B',
          descriptor:
            'Proponen una actividad en la que se comunica y se implementan normas de expresión escrita y utilización adecuada de recursos de cohesión.',
        },
        nivel_3: {
          nombre_nivel: 'C',
          descriptor:
            'Proponen una actividad en la que se comunica y se implementan normas, sin embargo, no se especifica cómo se involucrará a los estudiantes.',
        },
        nivel_4: {
          nombre_nivel: 'D',
          descriptor:
            'Describen una situación expuesta en el caso, sin proponer una actividad que involucre la comunicación e implementación de normas de convivencia.',
        },
      },
    },
    pa4: {
      tipo: 'PA_SP',
      nombre: 'Resolución de situaciones pedagógicas en Ed. Media',
      niveles: {
        nivel_1: {
          nombre_nivel: 'A',
          descriptor:
            'Proponen una actividad que permite conocer los intereses y expectativas de los estudiantes, considerando su heterogeneidad y la información entregada por el caso.',
        },
        nivel_2: {
          nombre_nivel: 'B',
          descriptor:
            'Proponen una actividad que permite conocer los intereses y expectativas de los estudiantes así como su heterogeneidad, sin embargo, está presentada de forma poco clara o detallada.',
        },
        nivel_3: {
          nombre_nivel: 'C',
          descriptor:
            'Proponen una actividad que es pertinente para el nivel expuesto en el caso, sin embargo, no permite recoger información sobre los intereses y expectativas de los estudiantes considerando la heterogeneidad de los estudiantes.',
        },
        nivel_4: {
          nombre_nivel: 'D',
          descriptor:
            'Mencionan una actividad o línea de acción que no es pertinente con el nivel expuesto en el caso o que no considera los intereses y expectativas de los estudiantes.',
        },
      },
    },
    pa5: {
      tipo: 'PA_CE',
      nombre: 'Habilidades de comunicación escrita',
      niveles: {
        nivel_1: {
          nombre_nivel: 'A',
          descriptor:
            'Son capaces de elaborar un texto de fácil comprensión, con una exposición de ideas focalizada en el tema.',
        },
        nivel_2: {
          nombre_nivel: 'B',
          descriptor:
            'Son capaces de elaborar un texto que comunica y reflexiona sobre las normas de expresión escrita.',
        },
        nivel_3: {
          nombre_nivel: 'C',
          descriptor:
            'Son capaces de elaborar un texto comprensible, aunque con cierto grado de dificultad.',
        },
        nivel_4: {
          nombre_nivel: 'D',
          descriptor:
            'Demuestran dificultades para elaborar un texto comprensible sobre el tema requerido.',
        },
      },
    },
  },
};

export enum Nivel_PA {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
}

export class Porcentaje {
  public valor: number;

  constructor(valor: number) {
    if (valor < 0 || valor > 1) {
      throw new Error('El valor debe estar entre 0 y 1.');
    }
    this.valor = valor;
  }

  public toString(decimals: number = 0) {
    if (decimals < 0) {
      console.error('No se admiten valores negativos, convirtiendo a 0');
      decimals = 0;
    }

    if (!Number.isInteger(decimals)) {
      console.error(
        'No es un número válido de decimales, convirtiendo a entero',
      );
      decimals = Math.floor(decimals);
    }

    return `${(this.valor * 100).toFixed(decimals)}%`;
  }
}

export type FORMATO_RESPUESTA = {
  tematicas: {
    t1: {
      e1: number;
      e2: number;
    };
    t2: {
      e3: number;
      e4: number;
      e5: number;
      e6: number;
      e7: number;
      e8: number;
    };
    t3: {
      e10: number;
    };
  };
  preguntas_abiertas: {
    pa1: {
      nivel_alcanzado: Nivel_PA;
    };
    pa2: {
      nivel_alcanzado: Nivel_PA;
    };
    pa3: {
      nivel_alcanzado: Nivel_PA;
    };
    pa4: {
      nivel_alcanzado: Nivel_PA;
    };
    pa5: {
      nivel_alcanzado: Nivel_PA;
    };
  };
};

export const ENDS: END[] = [
  {
    idEND: 1,
    fechaRendicion: new Date('2025'),
    formato: formato1,
  },
];

// fin end

export const MODALIDADES: Prisma.ModalidadCreateManyInput[] = [
  {
    idModalidad: 1,
    nombreModalidad: 'Escuela de lenguaje',
    descripcion: '',
    // si quieres forzar fecha:
    fechaCreacion: new Date(),
    fechaDesuso: null,
    fechaInicioValidez: new Date(),
    fechaFinValidez: new Date('2999-12-31'),
    validez: true,
  },
  {
    idModalidad: 2,
    nombreModalidad: 'Escuela especial',
    descripcion: '',
    fechaCreacion: new Date(),
    fechaDesuso: null,
    fechaInicioValidez: new Date(),
    fechaFinValidez: new Date('2999-12-31'),
    validez: true,
  },
  {
    idModalidad: 3,
    nombreModalidad: 'Integración escolar',
    descripcion: '',
    fechaCreacion: new Date(),
    fechaDesuso: null,
    fechaInicioValidez: new Date(),
    fechaFinValidez: new Date('2999-12-31'),
    validez: true,
  },
  {
    idModalidad: 4,
    nombreModalidad: 'Otro',
    descripcion: '',
    fechaCreacion: new Date(),
    fechaDesuso: null,
    fechaInicioValidez: new Date(),
    fechaFinValidez: new Date('2999-12-31'),
    validez: true,
  },
];


export const CONVENIOS: Convenio[] = [
  {
    idConvenio: 1,
    titulo:
      'Convenio con Servicio Local de Educación Pública Chinchorro (SLEP)',
    centroPractica: 'Servicio Local de Educación Pública Chinchorro (SLEP)',
    fechaInicioConvenio: new Date('2019-01-01'),
    fechaFinConvenio: undefined,
    validez: true,
    documentoConvenio: undefined,
    urlFoto: undefined,
    idModalidad: 3,
  },
  {
    idConvenio: 2,
    titulo: 'Convenio con Club Oro de Arica',
    centroPractica: 'Club Oro de Arica',
    fechaInicioConvenio: new Date('2020-01-01'),
    fechaFinConvenio: undefined,
    validez: true,
    documentoConvenio: undefined,
    urlFoto: undefined,
    idModalidad: 4,
  },
  {
    idConvenio: 3,
    titulo:
      'Convenio con Entidad individual educacional Colibrí de Arica E.I.E.',
    centroPractica: 'Entidad individual educacional Colibrí de Arica E.I.E.',
    fechaInicioConvenio: new Date('2020-01-01'),
    fechaFinConvenio: undefined,
    validez: true,
    documentoConvenio: undefined,
    urlFoto: undefined,
    idModalidad: 2,
  },
  {
    idConvenio: 4,
    titulo: 'Convenio con Integración Social del Limitado Visual Crisolvi',
    centroPractica: 'Integración Social del Limitado Visual Crisolvi',
    fechaInicioConvenio: new Date('2021-01-01'),
    fechaFinConvenio: undefined,
    validez: true,
    documentoConvenio: undefined,
    urlFoto: undefined,
    idModalidad: 2,
  },
  {
    idConvenio: 5,
    titulo: 'Convenio con Escuela Especial de Lenguaje Pieecitos de Niño C.E.',
    centroPractica: 'Escuela Especial de Lenguaje Pieecitos de Niño C.E.',
    fechaInicioConvenio: new Date('2021-01-01'),
    fechaFinConvenio: undefined,
    validez: true,
    documentoConvenio: undefined,
    urlFoto: undefined,
    idModalidad: 1,
  },
  {
    idConvenio: 6,
    titulo: 'Convenio con Corporación Educacional Parina',
    centroPractica: 'Corporación Educacional Parina',
    fechaInicioConvenio: new Date('2021-01-01'),
    fechaFinConvenio: undefined,
    validez: true,
    documentoConvenio: undefined,
    urlFoto: undefined,
    idModalidad: 1,
  },
  {
    idConvenio: 7,
    titulo: 'Convenio con Fundación Down',
    centroPractica: 'Fundación Down',
    fechaInicioConvenio: new Date('2021-01-01'),
    fechaFinConvenio: undefined,
    validez: true,
    documentoConvenio: undefined,
    urlFoto: undefined,
    idModalidad: 4,
  },
  {
    idConvenio: 8,
    titulo: 'Convenio con Colegio Tecnológico Don Bosco',
    centroPractica: 'Colegio Tecnológico Don Bosco',
    fechaInicioConvenio: new Date('2022-01-01'),
    fechaFinConvenio: undefined,
    validez: true,
    documentoConvenio: undefined,
    urlFoto: undefined,
    idModalidad: 3,
  },
  {
    idConvenio: 9,
    titulo:
      'Convenio con Centro de Rehabilitación y Educación Especial de Arica Kanttauru',
    centroPractica:
      'Centro de Rehabilitación y Educación Especial de Arica Kanttauru',
    fechaInicioConvenio: new Date('2022-01-01'),
    fechaFinConvenio: undefined,
    validez: true,
    documentoConvenio: undefined,
    urlFoto: undefined,
    idModalidad: 2,
  },
  {
    idConvenio: 10,
    titulo: 'Convenio con La Granjita School',
    centroPractica: 'La Granjita School',
    fechaInicioConvenio: new Date('2022-01-01'),
    fechaFinConvenio: undefined,
    validez: true,
    documentoConvenio: undefined,
    urlFoto: undefined,
    idModalidad: 3,
  },
  {
    idConvenio: 11,
    titulo: 'Convenio con Escuela de Lenguaje Lucerito Musikal',
    centroPractica: 'Escuela de Lenguaje Lucerito Musikal',
    fechaInicioConvenio: new Date('2023-01-01'),
    fechaFinConvenio: undefined,
    validez: true,
    documentoConvenio: undefined,
    urlFoto: undefined,
    idModalidad: 2,
  },
  {
    idConvenio: 12,
    titulo: 'Convenio con Colegio Mosaicos Corporación Educacional',
    centroPractica: 'Colegio Mosaicos Corporación Educacional',
    fechaInicioConvenio: new Date('2022-01-01'),
    fechaFinConvenio: undefined,
    validez: true,
    documentoConvenio: undefined,
    urlFoto: undefined,
    idModalidad: 3,
  },
  {
    idConvenio: 13,
    titulo: 'Convenio con Aulas Hospitalarias San Sebastián E.I.E.',
    centroPractica: 'Aulas Hospitalarias San Sebastián E.I.E.',
    fechaInicioConvenio: new Date('2023-01-01'),
    fechaFinConvenio: undefined,
    validez: true,
    documentoConvenio: undefined,
    urlFoto: undefined,
    idModalidad: 4,
  },
  {
    idConvenio: 14,
    titulo: 'Convenio con Colegio Especial Los Hibiscos',
    centroPractica: 'Colegio Especial Los Hibiscos',
    fechaInicioConvenio: new Date('2024-01-01'),
    fechaFinConvenio: undefined,
    validez: true,
    documentoConvenio: undefined,
    urlFoto: undefined,
    idModalidad: 2,
  },
  {
    idConvenio: 15,
    titulo: 'Convenio con Colegio Hispano',
    centroPractica: 'Colegio Hispano',
    fechaInicioConvenio: new Date('2024-01-01'),
    fechaFinConvenio: undefined,
    validez: true,
    documentoConvenio: undefined,
    urlFoto: undefined,
    idModalidad: 3,
  },
];

export const LINEA_ASIGNATURA: LineaAsignatura[] = [
  {
    idLinea: 1,
    idPlan: null,
    titulo: 'Corte Práctico',
    color: '#47b8e3',
  },
  {
    idLinea: 2,
    idPlan: null,
    titulo: 'Licenciatura',
    color: '#c2de37',
  },
];

export const USUARIOS: Prisma.UsuarioCreateManyInput[] = [
  {
    username: 'admin',
    email: 'admin@admin.com',
    role: 'Administrador',
    hashedPassword: 'admin',
    nombreCompleto: 'Administrador',
    idEstudiante: null,
  },
  {
    username: 'jc',
    role: 'JC',
    email: 'jc@jc.com',
    hashedPassword: 'jc',
    nombreCompleto: 'Jefe de Carrera',
    idEstudiante: null,
  },
  {
    username: 'coordinador',
    role: 'CoordinadorPractica',
    email: 'coordinador@practica.com',
    hashedPassword: 'coordinador',
    nombreCompleto: 'Coordinador de Práctica',
    idEstudiante: null,
  },
  {
    username: 'secretario',
    role: 'Secretario',
    email: 'secretario@secretario.com',
    hashedPassword: 'secretario',
    nombreCompleto: 'Secretario',
    idEstudiante: null,
  },
  {
    username: 'docente',
    role: 'Docente',
    email: 'docente@docente.com',
    hashedPassword: 'docente',
    nombreCompleto: 'Docente',
    idEstudiante: null,
  },
];

export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getRandomEnumValue<T>(enumObj: T): T[keyof T] {
  const enumValues = Object.values(enumObj);
  const randomIndex = Math.floor(Math.random() * enumValues.length);
  return enumValues[randomIndex];
}
