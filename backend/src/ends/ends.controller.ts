import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { EndsService } from './ends.service';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PatchResultadoENDDTO, PostResultadoENDDTO } from './dto/documento.dto';

@ApiTags('ENDs')
@Controller('ends')
export class EndsController {
  constructor(private endsService: EndsService) {}

  //BLOQUE Documentos de END
  @Get('documentos/')
  async getDatosResultadoEND() {
    return this.endsService.getDocumentosEND();
  }

  @Get('documentos/:idDato')
  async getDatoENDPorId(@Param('idDato', ParseIntPipe) idDato: number) {
    const documentoEND = await this.endsService.getDocumentoById(idDato);
    if (!documentoEND)
      throw new NotFoundException(
        'No existe ningún documento asociado a esa ID',
      );
    return documentoEND;
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('files', {
      storage: diskStorage({
        destination: './documents/end',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = file.originalname.split('.').pop();
          callback(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
        },
      }),
    }),
  )
  async postDocumentoEND(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDTO: PostResultadoENDDTO,
  ) {
    const extensionArchivo = file.originalname.split('.').pop();
    if (extensionArchivo != 'pdf') {
      throw new BadRequestException('Debe enviar un documento pdf');
    }
    const pathDocumento = file.path;
    return this.endsService.registrarNuevoResultadoEND(
      createDTO,
      pathDocumento,
    );
  }

  @Patch()
  @UseInterceptors(
    FileInterceptor('files', {
      storage: diskStorage({
        destination: './documents/end',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = file.originalname.split('.').pop();
          callback(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
        },
      }),
    }),
  )
  async updateInfoResultados(
    @UploadedFile() file: Express.Multer.File,
    @Body() updateDto: PatchResultadoENDDTO,
  ) {
    const extensionArchivo = file?.originalname.split('.').pop();
    if (extensionArchivo != 'pdf') {
      throw new BadRequestException('Debe enviar un documento pdf');
    }
    const pathDocumento = file.path;

    return this.endsService.actualizarDocumentoEND(updateDto, pathDocumento);
  }

  //FIN BLOQUE Documentos END
}
