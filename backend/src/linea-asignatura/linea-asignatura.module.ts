import { Module } from '@nestjs/common';
import { LineaAsignaturaController } from './linea-asignatura.controller';
import { LineaAsignaturaService } from './linea-asignatura.service';

@Module({
  controllers: [LineaAsignaturaController],
  providers: [LineaAsignaturaService],
})
export class LineaAsignaturaModule {}
