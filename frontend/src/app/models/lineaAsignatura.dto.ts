export interface Linea {
  id?: number;
  tituloNuevo?: string;
  nombre: string;
  asignaturas: AsignaturaLinea[];
  color: string;
}
  
export interface LineaActualizar {
  codigosAsignaturas: string[];
  tituloLineaRelacionada?: string;
  tituloNuevo?: string;
  colorNuevo?: string;
}

export interface LineaCambios{
  lineasNuevas: LineaActualizar[]
}

export interface AsignaturaLinea {
  titulo?: string;
  codigo?: string;
  nombre: string;
  areaFormacion?: string;
  idAsignatura: number;
}

export interface LineasAsignaturas {
  [linea: string]: AsignaturaLinea[];
}

export interface LineaPlan {
  idPlan: number;
  tituloPlan: string;
  lineasAsignatura: {
    idLinea: number;
    titulo: string;
    color: string;
  }[]
}

export interface Lineas{
  idLinea: number,
  titulo: string,
}