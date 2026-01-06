import { Convenio } from '@prisma/client';

export interface DetalleConvenioDTO {
  convenio: Convenio;
  nroPracticasRealizadas: number;
  promedioPracticas: number;
  porcentajeAprobacion: number;
  porcentajeReprobacion: number;
}
