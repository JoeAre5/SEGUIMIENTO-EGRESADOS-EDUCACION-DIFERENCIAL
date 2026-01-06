export interface CursoDTO {
    id: number;
    nombre: string;
    anio: number;
    semestre: number;
    porcentajeAprobacion: number;
    porcentajeReprobacion: number;
}

export interface AprobacionCursoDTO{
    codigoPlan: number;
    agnioRendicion: number;
    cohorte: number;
    tituloPlan: string;
    aprobacionAnual: number;
}
  
  