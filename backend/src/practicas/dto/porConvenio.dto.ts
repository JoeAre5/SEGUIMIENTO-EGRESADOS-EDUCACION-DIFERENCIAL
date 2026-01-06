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
