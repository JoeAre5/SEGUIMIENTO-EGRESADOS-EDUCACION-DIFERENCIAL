import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentoEND } from '@prisma/client';
import { PatchResultadoENDDTO, PostResultadoENDDTO } from './dto/documento.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as fs from 'fs';

@Injectable()
export class EndsService {
  constructor(private prisma: PrismaService) {}
  /*
  async getAll() {
    return this.prisma.eND.findMany();
  }

  async getOneEnd(endId: number) {
    return this.prisma.eND.findMany({
      where: { idEND: endId },
    });
  }

  async getResultadosEND(endId: number) {
    return this.prisma.resultadoEND.findMany({
      where: { idEND: endId },
    });
  }

  async getResumenPorAlumnoEND(idEND: number, idEstudiante: number) {
    return this.prisma.resultadoEND.findMany({
      where: { idEND: idEND, idEstudiante: idEstudiante },
      include: {
        EstudianteAsociado: true,
        ENDAsociada: true,
      },
    });
  }
  */
  //BLOQUE Documentos de END
  async getDocumentosEND(): Promise<DocumentoEND[]> {
    return this.prisma.documentoEND.findMany();
  }

  async getDocumentoById(idDato: number): Promise<DocumentoEND> {
    return this.prisma.documentoEND.findUnique({
      where: { idDato: idDato },
    });
  }
  async registrarNuevoResultadoEND(
    createDto: PostResultadoENDDTO,
    pathDocumento: string,
  ) {
    try {
      return this.prisma.documentoEND.create({
        data: {
          rutaDocumento: pathDocumento,
          cohorteAsociado: +createDto.cohorteAsociado,
          agnoRendicion: +createDto.agnoRendicion,
          fechaSubida: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // unique constraint
        if (error.code === 'P2002') {
          console.error(error);
          try {
            //console.log(pathsArchivos);
            if (fs.existsSync(pathDocumento)) {
              fs.unlinkSync(pathDocumento); //si la end no es válida se borra
            }
          } catch (unlinkError) {
            console.error(`Error al eliminar el archivo`, unlinkError);
          }
          throw new ForbiddenException('Información Duplicada');
        }
      } else {
        throw error;
      }
    }
  }
  actualizarDocumentoEND(
    updateDto: PatchResultadoENDDTO,
    pathDocumento: string,
  ) {
    try {
      return this.prisma.documentoEND.update({
        where: { idDato: +updateDto.idDato },
        data: {
          rutaDocumento: pathDocumento,
          cohorteAsociado: +updateDto.cohorteAsociado,
          agnoRendicion: +updateDto.agnoRendicion,
          fechaSubida: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.error(error);
        try {
          //console.log(pathsArchivos);
          if (fs.existsSync(pathDocumento)) {
            fs.unlinkSync(pathDocumento); //si la end no es válida se borra
          }
        } catch (unlinkError) {
          console.error(`Error al eliminar el archivo`, unlinkError);
        }
        throw new BadRequestException('Error en los datos de la query');
      } else {
        throw error;
      }
    }
  }

  //FIN BLOQUE Documentos END
}
