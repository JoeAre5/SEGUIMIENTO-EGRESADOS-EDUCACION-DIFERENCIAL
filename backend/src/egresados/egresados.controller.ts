import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { EgresadosService } from './egresados.service';
import { CreateEgresadoDto } from './dto/create-egresado.dto';
import { UpdateEgresadoDto } from './dto/update-egresado.dto';

// ✅ Guards
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@ApiTags('egresados')
@Controller('egresados')
@UseGuards(AuthGuard('jwt'), RolesGuard) // ✅ seguridad base para TODO el controller
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

  // ============================================================
  // ✅ EGRESADO: GET /egresados/mine
  // Devuelve el seguimiento del egresado autenticado (si existe)
  // ============================================================
  @Get('mine')
  @Roles('EGRESADO')
  getMine(@Req() req: any) {
    // El backend decide "quién es" por token, no por URL
    return this.egresadosService.findMine(Number(req.user.idEstudiante));
  }

  // ============================================================
  // ✅ EGRESADO: POST /egresados/mine (con docs)
  // Crea (o upsert) el suyo. NO acepta idEstudiante desde frontend.
  // ============================================================
  @Post('mine')
  @Roles('EGRESADO')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('documentos', 10, {
      storage: EgresadosController.storage,
    }),
  )
  createMine(
    @Req() req: any,
    @Body() dto: CreateEgresadoDto,
    @UploadedFiles() archivos: Express.Multer.File[],
  ) {
    // ✅ ignoramos cualquier idEstudiante que venga del cliente
    dto.idEstudiante = Number(req.user.idEstudiante);

    return this.egresadosService.create(dto, archivos);
  }

  // ============================================================
  // ✅ EGRESADO: PATCH /egresados/mine (con o sin docs)
  // Actualiza SOLO el suyo. No hay forma de pasar idEstudiante.
  // ============================================================
  @Patch('mine')
  @Roles('EGRESADO')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('documentos', 10, {
      storage: EgresadosController.storage,
    }),
  )
  updateMine(
    @Req() req: any,
    @Body() dto: UpdateEgresadoDto,
    @UploadedFiles() archivos: Express.Multer.File[],
  ) {
    return this.egresadosService.updateByEstudiante(
      Number(req.user.idEstudiante),
      dto,
      archivos,
    );
  }

  // ==========================
  // POST /egresados (con docs)
  // ==========================
  @Post()
  // ✅ Roles reales del enum ROLE (usuarios.prisma)
  @Roles('Administrador', 'Secretario', 'CoordinadorPractica', 'JC')
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
    if (dto?.idEstudiante !== undefined && dto?.idEstudiante !== null) {
      dto.idEstudiante = Number(dto.idEstudiante);
    }

    return this.egresadosService.create(dto, archivos);
  }

  // ==========================
  // ✅ GET /egresados/dashboard/cohortes
  // ==========================
  @Get('dashboard/cohortes')
  @Roles('Administrador', 'Secretario', 'CoordinadorPractica', 'JC')
  getDashboardCohortes() {
    return this.egresadosService.getDashboardCohortes();
  }

  // ==========================
  // GET /egresados
  // ==========================
  @Get()
  @Roles('Administrador', 'Secretario', 'CoordinadorPractica', 'JC')
  findAll() {
    return this.egresadosService.findAll();
  }

  // ==========================
  // GET /egresados/estudiante/:idEstudiante
  // ==========================
  @Get('estudiante/:idEstudiante')
  @Roles('Administrador', 'Secretario', 'CoordinadorPractica', 'JC')
  findOne(@Param('idEstudiante') idEstudiante: string) {
    return this.egresadosService.findOne(Number(idEstudiante));
  }

  // ==========================
  // PATCH /egresados/estudiante/:idEstudiante (con o sin docs)
  // ==========================
  @Patch('estudiante/:idEstudiante')
  @Roles('Administrador', 'Secretario', 'CoordinadorPractica', 'JC')
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
    return this.egresadosService.updateByEstudiante(
      Number(idEstudiante),
      dto,
      archivos,
    );
  }

  // ==========================
  // DELETE /egresados/documento/:idDocumento
  // ==========================
  @Delete('documento/:idDocumento')
  @Roles('Administrador', 'Secretario', 'CoordinadorPractica', 'JC')
  deleteDocumento(@Param('idDocumento') idDocumento: string) {
    return this.egresadosService.deleteDocumento(Number(idDocumento));
  }

  // ==========================
  // DELETE /egresados/:idEgresado
  // ==========================
  @Delete(':idEgresado')
  @Roles('Administrador', 'Secretario', 'CoordinadorPractica', 'JC')
  delete(@Param('idEgresado') idEgresado: string) {
    return this.egresadosService.delete(Number(idEgresado));
  }
}
