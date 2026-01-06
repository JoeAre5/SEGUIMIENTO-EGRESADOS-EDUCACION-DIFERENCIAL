import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LineaAsignaturaService } from './linea-asignatura.service';
import { ActualizarDatosLineaDTO, CrearLineaDTO, UpdateLineaDTO } from './dto';

@ApiTags('Lineas de Asignaturas')
@Controller('lineas-asignaturas')
export class LineaAsignaturaController {
  constructor(private lineaService: LineaAsignaturaService) {}

  //OBTIENE LAS LINEAS Y SUS ASIGNATURAS
  @Get('/planes/:idPlan/asignaturas')
  public async getAsignaturasEnLineasDeAsignaturaDePlan(
    @Param('idPlan', ParseIntPipe) idPlan: number,
  ) {
    return await this.lineaService.getLineasConAsignaturasDePlan(idPlan);
  }

  //OBTIENE SOLO LOS TITULOS DE LAS LINEAS
  @Get('/planes/:idPlan')
  public async getAllLineaAsignaturasDePlan(
    @Param('idPlan', ParseIntPipe) idPlan: number,
  ) {
    return await this.lineaService.getAllLineasAsignaturasDePlan(idPlan);
  }

  @Post('/planes/:idPlan/asignaturas')
  public async actualizarDatosPorPlan(
    @Param('idPlan', ParseIntPipe) idPlan: number,
    @Body() dto: ActualizarDatosLineaDTO,
  ) {
    const result = await this.lineaService.updateDatosLineaPorPlan(idPlan, dto);

    return result;
  }

  @Get()
  public getAllLineaAsignaturas() {
    return this.lineaService.getAllLineasAsignatura();
  }

  @Get('/planes/:idPlan/lineas/:idLinea')
  public async getLinea(
    @Param('idPlan', ParseIntPipe) idPlan: number,
    @Param('idLinea', ParseIntPipe) idLinea: number,
  ) {
    const result = await this.lineaService.findOne(idPlan, idLinea);

    if (!result)
      throw new NotFoundException('No existe ninguna línea con ese título');

    return result;
  }

  @Delete('/planes/:idPlan/lineas/:idlinea')
  public async deleteLinea(
    @Param('idPlan', ParseIntPipe) idPlan: number,
    @Param('idlinea', ParseIntPipe) idLinea: number,
  ) {
    return await this.lineaService.borrarLinea(idPlan, idLinea);
  }

  @Put('/planes/:idPlan/lineas/:idLinea')
  public async updateLinea(
    @Param('idPlan', ParseIntPipe) idPlan: number,
    @Param('idLinea', ParseIntPipe) idLinea: number,
    @Body() dto: UpdateLineaDTO,
  ) {
    return await this.lineaService.actualizarLinea(idPlan, idLinea, dto);
  }

  @Post('/planes/:idPlan')
  public async createLinea(
    @Param('idPlan', ParseIntPipe) idPlan: number,
    @Body() dto: CrearLineaDTO,
  ) {
    return await this.lineaService.crearLinea(idPlan, dto);
  }
}
