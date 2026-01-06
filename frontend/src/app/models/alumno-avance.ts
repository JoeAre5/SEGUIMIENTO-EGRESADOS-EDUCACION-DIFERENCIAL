import { AvanceIndividual } from './avance_individual';
import { CursoRealizado } from './curso_realizado';
import { Estudiante } from './estudiante';
import { SemestreRealizado } from './semestre';

export class AlumnoAvance {
  estudiante: Estudiante = new Estudiante();
  cursosRealizados: CursoRealizado[] = [];
  avanceIndividual: SemestreRealizado[] = [];
  avanceCohorte: SemestreRealizado[] = [];
}
