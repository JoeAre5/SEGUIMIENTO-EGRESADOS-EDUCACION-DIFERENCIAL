import { AsignaturaListadaDTO } from './listar.dto';

export const ID_INGRESO_REGULAR = 309;
export const ID_INGRESO_PROSECUCION = 325;

//bloque promedios
export interface PromedioHistoricoGeneralDTO {
  agnio: number;
  promedio: number;
}

export interface PromedioHistoricoPorPlanDTO {
  codigoPlan: number;
  tituloPlan: string;
  agnioRendicion: number;
  promedioHistorico: number;
}

export interface PromedioHistoricoPorCohorteDTO {
  codigoPlan: number;
  tituloPlan: string;
  agnioRendicion: number;
  cohorte: number;
  promedioAnual: number;
}
//fin bloque promedios

//bloque aprobacion
export interface AprobacionHistoricaGeneralDTO {
  agnio: number;
  aprobacion: number;
}

export interface AprobacionHistoricaPorPlanDTO {
  codigoPlan: number;
  tituloPlan: string;
  agnioRendicion: number;
  aprobacionHistorica: number;
}

export interface AprobacionHistoricaPorCohorteDTO {
  codigoPlan: number;
  tituloPlan: string;
  agnioRendicion: number;
  cohorte: number;
  aprobacionAnual: number;
}
//fin bloque aprobacion

export interface DetalleAsignaturaDTO {
  asignaturas: AsignaturaListadaDTO;
  promedios: {
    general: PromedioHistoricoGeneralDTO[];
    promediosPorPlan: PromedioHistoricoPorPlanDTO[];
    cohortes: PromedioHistoricoPorCohorteDTO[];
  };
  aprobaciones: {
    general: AprobacionHistoricaGeneralDTO[];
    aprobacionesPorPlan: AprobacionHistoricaPorPlanDTO[];
    cohortes: AprobacionHistoricaPorCohorteDTO[];
  };
}
