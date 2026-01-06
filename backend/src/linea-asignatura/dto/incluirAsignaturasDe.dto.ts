export interface AsignaturaDeLinea {
  titulo: string;
  idAsignatura: number;
  codigo: string;
  nombre: string;
  areaFormacion: string;
}
export interface LineaConAsignaturas
  extends Record<string, AsignaturaDeLinea[]> {}
