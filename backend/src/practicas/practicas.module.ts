import { Module } from '@nestjs/common';
import { PracticasController } from './practicas.controller';
import { PracticasService } from './practicas.service';
import { EstudiantesService } from '../estudiantes/estudiantes.service';
import { CursosService } from 'src/cursos/cursos.service';

@Module({
  controllers: [PracticasController],
  providers: [PracticasService, EstudiantesService, CursosService],
})
export class PracticasModule {}
