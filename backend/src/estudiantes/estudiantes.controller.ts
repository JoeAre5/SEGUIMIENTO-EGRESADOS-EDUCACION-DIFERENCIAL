import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
  Delete,
} from '@nestjs/common';

import { EstudiantesService } from './estudiantes.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';

@Controller('estudiantes')
export class EstudiantesController {
  constructor(private estudianteService: EstudiantesService) {}

  // ✅ LISTAR estudiantes (para dropdown egresados)
  @Get()
  public async findAll() {
    return this.estudianteService.findAll();
  }

  // ✅ CREAR estudiante nuevo
  @Post()
  public async create(@Body() dto: CreateEstudianteDto) {
    return this.estudianteService.create(dto);
  }

  // ✅ Estudiantes por cohorte (⚠️ debe ir ANTES que rutas dinámicas)
  @Get('cohorte')
  public async getEstudiantesPorCohorte() {
    return this.estudianteService.getEstudiantesPorCohorte();
  }

  // ✅ Avance estudiante por id
  @Get(':idEstudiante/avance')
  public async getAvanceDeEstudiante(
    @Param('idEstudiante', ParseIntPipe) idEstudiante: number,
  ) {
    return this.estudianteService.obtAvanceDe(idEstudiante);
  }

  // ✅ ACTUALIZAR estudiante por id
  @Patch(':idEstudiante')
  public async update(
    @Param('idEstudiante', ParseIntPipe) idEstudiante: number,
    @Body() dto: UpdateEstudianteDto,
  ) {
    return this.estudianteService.update(idEstudiante, dto);
  }

  // ✅ ELIMINAR estudiante por id
  @Delete(':idEstudiante')
  public async remove(
    @Param('idEstudiante', ParseIntPipe) idEstudiante: number,
  ) {
    return this.estudianteService.delete(idEstudiante);
  }
}
