import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateEgresadoDto {
  @IsInt()
  idEstudiante: number;

  @IsDateString()
  fechaEgreso: string;

  @IsString()
  situacionActual: string;

  @IsOptional()
  @IsString()
  empresa?: string;

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsOptional()
  @IsInt()
  sueldo?: number;

  @IsOptional()
  @IsInt()
  anioIngresoLaboral?: number;

  @IsOptional()
  @IsInt()
  anioSeguimiento?: number;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  emailContacto?: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  contactoAlternativo?: string;
}
