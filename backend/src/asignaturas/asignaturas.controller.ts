import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { AsignaturasService } from './asignaturas.service';
import { ApiTags } from '@nestjs/swagger';
import { Asignatura, CARACTER } from '@prisma/client';
import { DetalleAsignaturaDTO } from './dto/detalles.dto';

@ApiTags('asignaturas')
@Controller('asignaturas')
export class AsignaturasController {
  constructor(private asigService: AsignaturasService) {}

  /**
   * Retorna todas las asignaturas
   * @returns AsignaturaListadaDTO[]
   */
  @Get()
  public async getListaAsignaturas() {
    return await this.asigService.listarAsignaturas();
  }

  /**
   * Retorna las asignaturas con carácter práctico
   * Retorna más de una asignatura si es que esta participa en varios planes
   * @returns Asignatura[]
   */
  @Get('corte-practico')
  public getAsignaturasCortePractico() {
    return this.asigService.getAsignaturasPorCaracter(CARACTER.PRACTICA);
  }

  /**
   * Retorna las asignaturas dado el código que tienen
   * Retorna más de una asignatura si es que esta participa en varios planes
   * @returns Asignatura[]
   */
  @Get(':codigoAsignatura')
  public getAsignatura(@Param('codigoAsignatura') codigoAsignatura: string) {
    const result = this.asigService.getAsignatura(codigoAsignatura);

    if (!result) throw new NotFoundException('La asignatura no existe');

    return result;
  }

  /**
   * Retorna la asignatura con el código de asignatura y el id del plan especificados
   * @param codigoAsignatura Código de la Asignatura
   * @param idPlan Id del Plan
   * @returns {Asignatura[]}
   */
  @Get(':codigoAsignatura/plan/:idPlan')
  public getAsignaturaDePlan(
    @Param('codigoAsignatura') codigoAsignatura: string,
    @Param('idPlan') idPlan: number,
  ): Promise<Asignatura> {
    const result = this.asigService.getAsignaturaDePlan(
      idPlan,
      codigoAsignatura,
    );

    if (!result)
      throw new NotFoundException('La asignatura contemplada no existe');

    return result;
  }

  /**
   * Endpoint para recuperar información estadística detallada de una asignatura
   * dependiendo del plan, del cohorte y datos generales a lo largo del tiempo.
   *
   * @param codigoAsignatura Código de la asignatura
   * @returns {}
   */
  @Get(':codigoAsignatura/detalle')
  public async getDetalleAsignatura(
    @Param('codigoAsignatura') codigoAsignatura: string,
  ): Promise<DetalleAsignaturaDTO> {
    return this.asigService.getDetalleHistoricoAsignatura(codigoAsignatura);
  }

  @Get('corte-practico/tendencias')
  public async getTendenciasCortePractico() {
    return this.asigService.getDetalleHistoricoAsignaturasCortePractico();
  }

  @Get('aprobacion-curso/:codigoAsignatura')
  public async getAprobacionPorCursacionDeAsignatura(
    @Param('codigoAsignatura') codigoAsignatura: string,
  ) {
    return this.asigService.getAprobacionHistoricaPorCohorte(codigoAsignatura);
  }

  @Get('promedios/general/:codigoAsignatura')
  public async getPromediosHistoricos(
    @Param('codigoAsignatura') codigoAsignatura: string,
  ) {
    return this.asigService.getPromediosHistoricosGeneral(codigoAsignatura);
  }
}
