import { Module } from '@nestjs/common';
import { EgresadosController } from './egresados.controller';
import { EgresadosService } from './egresados.service';
import { PrismaService } from '../prisma/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import { PdfService } from './pdf/pdf.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './documents/egresados',
    }),
  ],
  controllers: [EgresadosController],
  providers: [EgresadosService, PrismaService, PdfService],
})
export class EgresadosModule {}
