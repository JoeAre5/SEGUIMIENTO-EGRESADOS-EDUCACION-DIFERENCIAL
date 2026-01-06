import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { PlanesEstudioService } from './planes-estudio.service';
import { ApiTags } from '@nestjs/swagger';
import { CreatePlanDTO, ModifyPlanDTO } from './dto';
import { AsignaturasService } from '../asignaturas/asignaturas.service';

@ApiTags('planes-de-estudio')
@Controller('planes-de-estudio')
export class PlanesEstudioController {
  constructor(
    private planesEstudioService: PlanesEstudioService,
    private asignaturasService: AsignaturasService,
  ) {}

  // retorna cada código
  // (identificador) de un plan
  // EJ: 2018 (v1)
  @Get()
  getAll() {
    const result = this.planesEstudioService.findAll();

    if (!result) throw new NotFoundException('No existen planes registrados');

    return result;
  }

  @Get(':idPlan')
  getOne(@Param('idPlan', ParseIntPipe) idPlan: number) {
    const result = this.planesEstudioService.findOne(idPlan);

    if (!result) throw new NotFoundException('No existe el plan especificado');

    return result;
  }

  @Get(':idPlan/asignaturas')
  public getAsignaturas(@Param('idPlan', ParseIntPipe) idPlan: number) {
    const result = this.asignaturasService.getAsignaturasDePlan(idPlan);

    if (!result) throw new NotFoundException('No existe fluxograma asociado');

    return result;
  }

  @Post()
  createPlan(@Body() dto: CreatePlanDTO) {
    return this.planesEstudioService.createPlan(dto);
  }

  @Delete(':idPlan')
  deletePlan(@Param('idPlan', ParseIntPipe) idPlan: number) {
    return this.deletePlan(idPlan);
  }

  @Patch(':idPlan')
  patchPlan(@Param('idPlan') idPlan: number, @Body() dto: ModifyPlanDTO) {
    return this.planesEstudioService.modifyPlan(idPlan, dto);
  }

  @Get(':idPlan/fluxograma')
  async getFluxogramaDe(@Param('idPlan', ParseIntPipe) idPlan: number) {
    return this.planesEstudioService.getFluxogram(idPlan);
  }

  @Get(':idPlan/lineas')
  async getLineasDeAsignaturas(@Param('idPlan', ParseIntPipe) idPlan: number) {
    const result = this.planesEstudioService.getLineasDeAsignaturas(idPlan);

    if (!result)
      throw new NotFoundException(
        'No existen líneas de asignaturas definidas para el plan especificado',
      );

    return result;
  }

  @Get(':idPlan/lineas/:idLinea')
  async getOneLineaDeAsignatura(
    @Param('idPlan', ParseIntPipe) idPlan: number,
    @Param('idLinea', ParseIntPipe) idLinea: number,
  ) {
    const result = this.planesEstudioService.findOneLineaAsignatura(
      idPlan,
      idLinea,
    );

    if (!result)
      throw new NotFoundException(
        'No existe la línea especificada para el plan especificado',
      );

    return result;
  }
}
