import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateEgresadoDto {
  @IsOptional()
  @IsString()
  situacionActual?: string;

  @IsOptional()
  @IsString()
  empresa?: string;

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsOptional()
  sueldo?: number;

  @IsOptional()
  anioIngresoLaboral?: number;

  @IsOptional()
  @IsInt()
  anioSeguimiento?: number;

  @IsOptional()
  telefono?: string;

  @IsOptional()
  emailContacto?: string;

  @IsOptional()
  direccion?: string;

  @IsOptional()
  linkedin?: string;

  @IsOptional()
  contactoAlternativo?: string;
}
