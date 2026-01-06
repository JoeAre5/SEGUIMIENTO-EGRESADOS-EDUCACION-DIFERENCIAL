import { Asignatura } from "./asignaturas.dto"

export interface DetalleFluxograma{
    id: number;
    planEstudio: string;
    codigo: string;
    semestres: number;
    asignaturas: Asignatura[];
}