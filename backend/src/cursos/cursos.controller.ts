import { Controller } from '@nestjs/common';
import { CursosService } from './cursos.service';

@Controller('cursos')
export class CursosController {
  constructor(private cursoService: CursosService) {}

  /*
  //retorna todos los cursos
  //asociados a una asignatura
  @Get('/curso/idAsignatura')
  getCursos() {
    return this.cursoService;
  }

  //retorna informacion del curso específico
  @Get('/curso/idAsignatura/idCurso')
  getInfoCurso(id: number) {
    return this.cursoService;
  }

  REACTIVAR CUANDO SE NECESITE, ASÍ NO SIRVE DE NADA
  */
}
