import { Module } from '@nestjs/common';
import { AsignaturasController } from './asignaturas.controller';
import { AsignaturasService } from './asignaturas.service';
import { CursosService } from 'src/cursos/cursos.service';
import { CursosModule } from 'src/cursos/cursos.module';

@Module({
  controllers: [AsignaturasController],
  providers: [AsignaturasService],
  imports: [CursosModule],
})
export class AsignaturasModule {}
