import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { EstudiantesService } from './estudiantes.service';

@Controller('estudiantes')
export class EstudiantesController {
  constructor(private estudianteService: EstudiantesService) {}

  @Get(':idEstudiante/avance')
  public async getAvanceDeEstudiante(
    @Param('idEstudiante', ParseIntPipe) idEstudiante: number,
  ) {
    return this.estudianteService.obtAvanceDe(idEstudiante);
  }

  @Get('cohorte')
  public async getEstudiantesPorCohorte() {
    return this.estudianteService.getEstudiantesPorCohorte();
  }
}
