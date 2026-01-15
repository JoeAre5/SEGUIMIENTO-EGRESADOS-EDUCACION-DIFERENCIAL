import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { EgresadosService } from './egresados.service';
import { CreateEgresadoDto } from './dto/create-egresado.dto';
import { UpdateEgresadoDto } from './dto/update-egresado.dto';

@ApiTags('egresados')
@Controller('egresados')
export class EgresadosController {
  constructor(private readonly egresadosService: EgresadosService) {}

  // ==========================
  // Config Multer
  // ==========================
  private static storage = diskStorage({
    destination: './documents/egresados',
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${extname(file.originalname)}`);
    },
  });

  // ==========================
  // POST /egresados (con docs)
  // ==========================
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('documentos', 10, {
      storage: EgresadosController.storage,
    }),
  )
  create(
    @Body() dto: CreateEgresadoDto,
    @UploadedFiles() archivos: Express.Multer.File[],
  ) {
    // ✅ IMPORTANTE: cuando viene multipart/form-data, números llegan como string
    // El service ya hace Number() donde corresponde, pero aquí dejamos idEstudiante sólido
    dto.idEstudiante = Number(dto.idEstudiante);

    return this.egresadosService.create(dto, archivos);
  }

  // ==========================
  // ✅ GET /egresados/dashboard/cohortes
  // ==========================
  @Get('dashboard/cohortes')
  getDashboardCohortes() {
    return this.egresadosService.getDashboardCohortes();
  }

  // ==========================
  // GET /egresados
  // ==========================
  @Get()
  findAll() {
    return this.egresadosService.findAll();
  }

  // ==========================
  // GET /egresados/estudiante/:idEstudiante
  // ==========================
  @Get('estudiante/:idEstudiante')
  findOne(@Param('idEstudiante') idEstudiante: string) {
    return this.egresadosService.findOne(Number(idEstudiante));
  }

  // ==========================
  // PATCH /egresados/estudiante/:idEstudiante (con o sin docs)
  // ==========================
  @Patch('estudiante/:idEstudiante')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('documentos', 10, {
      storage: EgresadosController.storage,
    }),
  )
  updateByEstudiante(
    @Param('idEstudiante') idEstudiante: string,
    @Body() dto: UpdateEgresadoDto,
    @UploadedFiles() archivos: Express.Multer.File[],
  ) {
    // ✅ si viene multipart/form-data, todo viene string.
    // el service se encarga de parsear fecha y números.
    return this.egresadosService.updateByEstudiante(Number(idEstudiante), dto, archivos);
  }

  // ==========================
  // DELETE /egresados/documento/:idDocumento
  // ==========================
  @Delete('documento/:idDocumento')
  deleteDocumento(@Param('idDocumento') idDocumento: string) {
    return this.egresadosService.deleteDocumento(Number(idDocumento));
  }

  // ==========================
  // DELETE /egresados/:idEgresado
  // ==========================
  @Delete(':idEgresado')
  delete(@Param('idEgresado') idEgresado: string) {
    return this.egresadosService.delete(Number(idEgresado));
  }
}
