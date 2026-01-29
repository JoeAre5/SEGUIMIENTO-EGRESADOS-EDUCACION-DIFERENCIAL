import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
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

import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { ConsentimientoDto } from './dto/consentimiento.dto';
import type { Response } from 'express';

@ApiTags('egresados')
@Controller('egresados')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class EgresadosController {
  constructor(private readonly egresadosService: EgresadosService) {}

  private static storage = diskStorage({
    destination: './documents/egresados',
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${extname(file.originalname)}`);
    },
  });

  @Get('mine')
  @Roles('EGRESADO')
  getMine(@Req() req: any) {
    return this.egresadosService.findMine(Number(req.user.idEstudiante));
  }

  @Roles('EGRESADO')
  @Get('mine/consentimiento')
  getConsentimientoMine(@Req() req: any) {
    return this.egresadosService.getConsentimientoMine(req.user);
  }

  @Roles('EGRESADO')
  @Patch('mine/consentimiento')
  setConsentimientoMine(@Req() req: any, @Body() dto: ConsentimientoDto) {
    return this.egresadosService.setConsentimientoMine(req.user, dto.acepta);
  }

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
    dto.idEstudiante = Number(req.user.idEstudiante);
    return this.egresadosService.create(dto, archivos);
  }

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

  @Delete('mine/documento/:idDocumento')
  @Roles('EGRESADO')
  deleteDocumentoMine(
    @Param('idDocumento') idDocumento: string,
    @Req() req: any,
  ) {
    return this.egresadosService.deleteDocumentoMine(
      Number(idDocumento),
      Number(req.user.idEstudiante),
    );
  }

  @Post()
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
    if (dto?.idEstudiante !== undefined && dto?.idEstudiante !== null) {
      dto.idEstudiante = Number(dto.idEstudiante);
    }

    return this.egresadosService.create(dto, archivos);
  }

  @Get('dashboard/cohortes')
  @Roles('Administrador', 'Secretario', 'CoordinadorPractica', 'JC')
  getDashboardCohortes() {
    return this.egresadosService.getDashboardCohortes();
  }

  @Get()
  @Roles('Administrador', 'Secretario', 'CoordinadorPractica', 'JC')
  findAll() {
    return this.egresadosService.findAll();
  }

  @Get('estudiante/:idEstudiante')
  @Roles('Administrador', 'Secretario', 'CoordinadorPractica', 'JC')
  findOne(@Param('idEstudiante') idEstudiante: string) {
    return this.egresadosService.findOne(Number(idEstudiante));
  }

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
    return this.egresadosService.updateByEstudiante(
      Number(idEstudiante),
      dto,
      archivos,
    );
  }

  @Delete('documento/:idDocumento')
  @Roles('Administrador', 'Secretario', 'CoordinadorPractica', 'JC')
  deleteDocumento(@Param('idDocumento') idDocumento: string) {
    return this.egresadosService.deleteDocumento(Number(idDocumento));
  }

  @Delete(':idEgresado')
  @Roles('Administrador', 'Secretario', 'CoordinadorPractica', 'JC')
  delete(@Param('idEgresado') idEgresado: string) {
    return this.egresadosService.delete(Number(idEgresado));
  }

  // ---------------------------------------------------------------------------
  // ✅ NUEVO: PDF FICHA EGRESADO (SOLO ADMIN y JC)
  // GET /egresados/estudiante/:idEstudiante/pdf
  // ---------------------------------------------------------------------------
  @Get('estudiante/:idEstudiante/pdf')
  @Roles('Administrador', 'JC')
  async fichaPdfByEstudiante(
    @Res({ passthrough: true }) res: Response,
    @Param('idEstudiante') idEstudiante: string,
  ) {
    const buffer = await this.egresadosService.generarFichaPdfByEstudiante(
      Number(idEstudiante),
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ficha-egresado-${idEstudiante}.pdf"`,
    );

    return new StreamableFile(buffer);
  }

  // ---------------------------------------------------------------------------
  // ✅ NUEVO: INFORME ANALÍTICO POR COHORTES (SOLO ADMIN y JC)
  // GET /egresados/report/cohortes/pdf?from=2018&to=2026
  // ---------------------------------------------------------------------------
  @Get('report/cohortes/pdf')
  @Roles('Administrador', 'JC')
  async reporteCohortesPdf(
    @Res({ passthrough: true }) res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const buffer = await this.egresadosService.generarReporteCohortesPdf(
      from ? Number(from) : undefined,
      to ? Number(to) : undefined,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reporte-egresados-cohortes.pdf"`,
    );

    return new StreamableFile(buffer);
  }
}
