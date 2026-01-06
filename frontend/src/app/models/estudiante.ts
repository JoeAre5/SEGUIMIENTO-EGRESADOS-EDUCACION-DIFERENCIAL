import { InfoPracticaDTO } from './practica';

export class Estudiante {
  idEstudiante: number = 0;
  nombre_completo: string = '';
  rut: string = '';
  agnio_cohorte: number = 0;
  plan?: number = 0;
  nombreCompleto?: string = '';
  agnioIngreso?: number = 0;
  promedio?: number = 0;
}

export class EstudiantePracticas extends Estudiante {
  practicas: InfoPracticaDTO[] = [];
}
