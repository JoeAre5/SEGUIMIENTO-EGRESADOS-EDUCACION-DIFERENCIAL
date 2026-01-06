export interface AvanceDto {
  estudiante: InfoEstudianteDTO;
  cursosRealizados: CursoEstudianteDTO[];
  avanceIndividual: SemestreRealizadoDTO[];
  avanceCohorte: SemestreRealizadoDTO[];
}
export interface InfoEstudianteDTO {
  nombreCompleto: string;
  rut: string;
  agnioIngreso: number;
  plan: string;
  promedio: number;
}
export interface CursoEstudianteDTO {
  idAsignatura: number;
  nombreAsignatura: string;
  codigo: string;
  areaFormacion: string;
  agnioRealizacion: number;
  semestreRealizacion: number;
  numIntento: number;
  notaFinal: number;
}
export interface SemestreRealizadoDTO {
  numSemestre: number;
  promedio: number;
}
