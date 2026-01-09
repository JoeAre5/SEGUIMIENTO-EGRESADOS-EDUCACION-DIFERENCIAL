import { Module } from '@nestjs/common';
import { EgresadosController } from './egresados.controller';
import { EgresadosService } from './egresados.service';
import { PrismaService } from '../prisma/prisma.service';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      dest: './documents/egresados',
    }),
  ],
  controllers: [EgresadosController],
  providers: [EgresadosService, PrismaService],
})
export class EgresadosModule {}
