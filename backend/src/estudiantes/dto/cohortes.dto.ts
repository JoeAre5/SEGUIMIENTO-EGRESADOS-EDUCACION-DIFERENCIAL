export interface InfoCohorteEstudianteDTO {
  idEstudiante: number;
  nombreCompleto: string;
  rut: string;
  agnio_cohorte: number;
}

export interface ListarPorCohorteDTO {
  cohorte: number;
  estudiantes: InfoCohorteEstudianteDTO[];
}
