import { Module } from '@nestjs/common';
import { PlanesEstudioController } from './planes-estudio.controller';
import { PlanesEstudioService } from './planes-estudio.service';
import { AsignaturasService } from '../asignaturas/asignaturas.service';
import { CursosModule } from 'src/cursos/cursos.module';

@Module({
  controllers: [PlanesEstudioController],
  providers: [PlanesEstudioService, AsignaturasService],
  imports: [CursosModule],
})
export class PlanesEstudioModule {}
