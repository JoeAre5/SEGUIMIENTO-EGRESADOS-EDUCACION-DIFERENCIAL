import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  UploadedFiles,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';

import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express';

import { EgresadosService } from './egresados.service';
import { CreateEgresadoDto } from './dto/create-egresado.dto';
import { UpdateEgresadoDto } from './dto/update-egresado.dto';

@Controller('egresados')
export class EgresadosController {
  constructor(private readonly egresadosService: EgresadosService) {}

  // ✅ POST con múltiples archivos
  @Post()
  @UseInterceptors(
    FilesInterceptor('documentos', 10, {
      storage: diskStorage({
        destination: './documents/egresados',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  create(
    @Body() dto: CreateEgresadoDto,
    @UploadedFiles() archivos: Express.Multer.File[],
  ) {
    return this.egresadosService.create(dto, archivos);
  }

  // ✅ GET todos
  @Get()
  findAll() {
    return this.egresadosService.findAll();
  }

  // ✅ GET uno por idEstudiante
  @Get('estudiante/:idEstudiante')
  findOne(@Param('idEstudiante', ParseIntPipe) idEstudiante: number) {
    return this.egresadosService.findOne(idEstudiante);
  }

  // ✅ PATCH actualizar por idEstudiante (incluye documentos)
  @Patch('estudiante/:idEstudiante')
  @UseInterceptors(
    FilesInterceptor('documentos', 10, {
      storage: diskStorage({
        destination: './documents/egresados',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  updateByEstudiante(
    @Param('idEstudiante', ParseIntPipe) idEstudiante: number,
    @Body() dto: UpdateEgresadoDto,
    @UploadedFiles() archivos: Express.Multer.File[],
  ) {
    return this.egresadosService.updateByEstudiante(
      idEstudiante,
      dto,
      archivos || [],
    );
  }

  // ✅ ✅ ✅ DELETE documento individual
  // ✅ DELETE /egresados/documento/:idDocumento
  @Delete('documento/:idDocumento')
  deleteDocumento(@Param('idDocumento', ParseIntPipe) idDocumento: number) {
    return this.egresadosService.deleteDocumento(idDocumento);
  }

  // ✅ DELETE eliminar por idEgresado
  @Delete(':idEgresado')
  remove(@Param('idEgresado', ParseIntPipe) idEgresado: number) {
    return this.egresadosService.delete(idEgresado);
  }
}
