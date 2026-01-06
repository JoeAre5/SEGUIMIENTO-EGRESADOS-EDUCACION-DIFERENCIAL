import { AREA } from '@prisma/client';

export interface AsignaturaListadaDTO {
  idAsignatura: number;
  codigoAsignatura: string;
  nombreAsignatura: string;
  nombreCortoAsignatura: string;
  semestreRealizacion: number;
  areaFormacion: AREA;
  planes: {
    titulo: string;
    codigo: string;
    fechaInstauracion: Date;
  }[];
}
