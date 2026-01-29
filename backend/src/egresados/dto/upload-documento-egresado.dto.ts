import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadDocumentoEgresadoDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @IsIn(['CV', 'Certificado', 'Contrato', 'Otro'])
  tipo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?: string;
}
