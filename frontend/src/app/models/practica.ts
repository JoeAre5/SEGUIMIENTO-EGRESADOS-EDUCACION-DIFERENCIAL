import { Estudiante } from './estudiante';

export interface InfoPracticaDTO {
  nombrePractica: string;
  convenios: string[];
  modadidades: string[];
  centrosDePractica: string[];
  notaFinal: number;
  posicionRelativa: number;
  numIntento: number;
}

export class DetallesPracticaDTO {
  estudiante: Estudiante = new Estudiante();
  practicas: InfoPracticaDTO[] = [];
}

export interface PracticaEnConvenioDTO {
  idEstudiante: number;
  nombreCompleto: string;
  tituloPractica: string;
  numeroPractica: number;
  fechaInicio: Date;
  fechaFin: Date;
  notaFinal: number;
  idModalidad: number;
  nombreModalidad: string;
}

export interface ListarPracticasPorConvenioDTO {
  tituloConvenio: string;
  practicas: PracticaEnConvenioDTO[];
}