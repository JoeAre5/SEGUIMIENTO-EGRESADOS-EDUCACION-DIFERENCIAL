export interface AsignaturaFluxograma {
    idAsignatura: number;
    codigo: string;
    nombre: string;
    nombreCorto: string;
    unidad: string;
    caracter: string;
    areaFormacion: string;
    creditos: number;
    tributaciones: any[];
    prerrequisitos: any[];
    posicion: number;
    semestre: number;
    competencias: string[];
    descripcion: string;
    linkSyllabus: string;
    idPlan: number;
    idLinea: number;
    LineaContemplaAsignatura: LineaContemplaAsignaturaDTO
  }

export interface LineaContemplaAsignaturaDTO{
    idLinea: number;
    titulo: string;
    color: string;
    idPlan: number;
}

export interface PlanDetalleDTO {
    titulo: string;
    codigo: number;
    fechaInstauracion: string;
}

export interface AsignaturaDetalleDTO {
    idAsignatura: number;
    codigoAsignatura: string;
    nombreAsignatura: string;
    nombreCortoAsignatura: string;
    semestreRealizacion: number;
    areaFormacion: string;
    planes: PlanDetalleDTO[];
}

export interface PromedioGeneralDTO {
    agnio: number;
    promedio: number;
}
  
export interface PromedioCohorteDTO {
    agnioRendicion: number;
    cohorte: number;
    codigoPlan: number;
    tituloPlan: string;
    promedioAnual: number;
}
  
export interface PromedioPorPlanDTO {
    codigoPlan: number;
    tituloPlan: string;
    agnioRendicion: number;
    promedioHistorico: number;
}
  
export interface AprobacionGeneralDTO {
    agnio: number;
    aprobacion: number;
}
  
export interface AprobacionCohorteDTO {
    agnioRendicion: number;
    cohorte: number;
    codigoPlan: number;
    tituloPlan: string;
    aprobacionAnual: number;
}
  
export interface AprobacionPorPlanDTO {
    codigoPlan: number;
    tituloPlan: string;
    agnioRendicion: number;
    aprobacionHistorica: number;
}

export interface PromediosDTO {
    general: PromedioGeneralDTO[];
    cohortes: PromedioCohorteDTO[];
    promediosPorPlan: PromedioPorPlanDTO[];
}
  
export interface AprobacionesDTO {
    general: AprobacionGeneralDTO[];
    cohortes: AprobacionCohorteDTO[];
    aprobacionesPorPlan: AprobacionPorPlanDTO[];
}
  
export interface ReporteAsignaturaDTO {
    asignaturas: AsignaturaDetalleDTO;
    promedios: PromediosDTO;
    aprobaciones: AprobacionesDTO;
}
  