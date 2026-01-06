import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class UpdateConvenioDTO {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  centroPractica?: string;

  @IsOptional()
  @IsDate()
  fechaInicioConvenio?: Date;

  @IsOptional()
  @IsDate()
  fechaFinConvenio?: Date;

  @IsOptional()
  @IsString()
  documentoConvenio?: string;

  @IsOptional()
  @IsString()
  urlFoto?: string;

  @IsOptional()
  @IsNumber()
  idModalidad?: number;

  @IsOptional()
  @IsString()
  nombreModalidad: string;
}

export class CreateConvenioDTO {
  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsNotEmpty()
  @IsString()
  centroPractica: string;

  @IsOptional()
  @IsDate()
  fechaInicioConvenio?: Date;

  @IsOptional()
  @IsDate()
  fechaFinConvenio?: Date;

  @IsOptional()
  documentoConvenio?: string;

  @IsOptional()
  urlFoto?: string;

  @IsNotEmpty()
  @IsNumber()
  @ValidateIf((obj) => !obj.nombreModalidad)
  idModalidad?: number;

  @IsNotEmpty()
  @IsString()
  @ValidateIf((obj) => !obj.idModalidad)
  nombreModalidad?: string;
}
