import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConveniosService } from './convenios.service';
import { CreateConvenioDTO, UpdateConvenioDTO } from './dto/crud.dto';
import { diskStorage } from 'multer';
import { FilesInterceptor } from '@nestjs/platform-express';
@ApiTags('convenios')
@Controller('convenios')
export class ConveniosController {
  constructor(private convenioService: ConveniosService) {}

  @Get(':idConvenio')
  async getByIdConvenio(@Param('idConvenio', ParseIntPipe) idConvenio: number) {
    return this.convenioService.getDetalleConvenioCompleto(idConvenio);
  }

  @Get()
  async getAll() {
    return this.convenioService.listarConvenios();
  }

  @Patch(':idConvenio')
  @UseInterceptors(
    FilesInterceptor('files', 2, {
      storage: diskStorage({
        destination: './documents/convenios',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = file.originalname.split('.').pop();
          callback(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
        },
      }),
    }),
  )
  async update(
    @Param('idConvenio', ParseIntPipe) idConvenio: number,
    @Body() updateDTO: UpdateConvenioDTO,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const pdfFile = files.find((file) => file.mimetype === 'application/pdf');
    const imageFile = files.find((file) => file.mimetype.startsWith('image/'));
    const pdfPath = pdfFile?.path;
    const imagePath = imageFile?.path;

    return this.convenioService.updateConvenio(
      idConvenio,
      updateDTO,
      imagePath,
      pdfPath,
    );
  }

  @Delete(':idConvenio')
  async delete(@Param('idConvenio', ParseIntPipe) idConvenio: number) {
    return this.convenioService.invalidarConvenio(idConvenio);
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 2, {
      storage: diskStorage({
        destination: './documents/convenios',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = file.originalname.split('.').pop();
          callback(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
        },
      }),
    }),
  )
  async create(
    @Body()
    createDTO: CreateConvenioDTO,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const pdfFile = files.find((file) => file.mimetype === 'application/pdf');
    const imageFile = files.find((file) => file.mimetype.startsWith('image/'));

    if (!pdfFile) {
      throw new BadRequestException('Se requiere un archivo PDF.');
    }
    const pdfPath = pdfFile.path;
    const imagePath = imageFile
      ? imageFile.path
      : 'documents/convenios/default_convenio.jpg';

    return this.convenioService.createConvenio(createDTO, pdfPath, imagePath);
  }
}
