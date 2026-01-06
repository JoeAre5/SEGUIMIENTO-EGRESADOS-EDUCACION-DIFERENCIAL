import { InfoEstudianteDTO } from '../../estudiantes/dto/avance.dto';

export interface DetallePracticasDTO {
  estudiante: InfoEstudianteDTO;
  practicas: InfoPracticaDTO[];
}
export interface InfoPracticaDTO {
  idCursacion: number;
  notaFinal: number;
  codigoAsignatura: string;
  nombrePractica: string;
  plan: string;
  numIntento: number;
  posicionRelativa: number;
  convenios: string[];
  centrosDePractica: string[];
  modadidades: string[];
}
