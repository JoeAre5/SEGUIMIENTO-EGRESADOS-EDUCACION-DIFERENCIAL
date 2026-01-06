export interface GetLineaAsignaturaDTO {
  idLinea: number;
  titulo: string;
}
export interface ListarLineasAsignaturaDTO {
  idPlan: number;
  tituloPlan: string;
  lineasAsignatura: GetLineaAsignaturaDTO[];
}
