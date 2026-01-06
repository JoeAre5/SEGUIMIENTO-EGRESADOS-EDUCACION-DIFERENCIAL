import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { PracticasService } from './practicas.service';
import { ApiTags } from '@nestjs/swagger';
import { Asignatura } from '@prisma/client';

@ApiTags('practicas')
@Controller('practicas')
export class PracticasController {
  constructor(private practicaService: PracticasService) {}

  @Get('/plan/:idPlan')
  getAllByPlan(
    @Param('idPlan', ParseIntPipe) idPlan: number,
  ): Promise<Asignatura[]> {
    const result = this.practicaService.getAllPracticasDelPlan(idPlan);

    if (!result)
      throw new NotFoundException('No hay prácticas definidas en el plan');

    return result;
  }

  @Get('/plan/:idPlan/asignatura/:codigoPractica')
  getOne(
    @Param('idPlan', ParseIntPipe) idPlan: number,
    @Param('codigoPractica') codigoPractica: string,
  ) {
    return this.practicaService.getAllCursacionesPorCodigoAsignaturaPractica(
      idPlan,
      codigoPractica,
    );
  }

  @Get('estudiante/:idEstudiante')
  getByEstudiante(@Param('idEstudiante', ParseIntPipe) idEstudiante: number) {
    return this.practicaService.getDetallePracticasDeEstudiante(idEstudiante);
  }

  @Get('modalidades')
  getAllModalidades() {
    const result = this.practicaService.getAllModalidades();

    if (!result)
      throw new NotFoundException('No existen modalidades registradas');

    return result;
  }

  @Get('modalidades/:idModalidad')
  getOneModalidad(@Param('idModalidad') idModalidad: number) {
    const result = this.practicaService.getOneModalidad(idModalidad);

    if (!result)
      throw new NotFoundException('No existe la modalidad especificada');

    return result;
  }

  @Get('convenio/:idConvenio/')
  async getPracticasDeConvenio(@Param('idConvenio') idConvenio: number) {
    return this.practicaService.listarPracticasPorConvenio(idConvenio);
  }
}
