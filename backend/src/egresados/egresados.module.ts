import { Module } from '@nestjs/common';
import { EgresadosController } from './egresados.controller';
import { EgresadosService } from './egresados.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EgresadosController],
  providers: [EgresadosService],
})
export class EgresadosModule {}
