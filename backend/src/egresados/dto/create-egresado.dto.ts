import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEgresadoDto {
  @IsInt()
  idEstudiante: number;

  @IsNotEmpty()
  @IsString()
  fechaEgreso: string;

  @IsNotEmpty()
  @IsString()
  situacionActual: string;

  @IsOptional()
  empresa?: string;

  @IsOptional()
  cargo?: string;

  @IsOptional()
  sueldo?: number;

  @IsOptional()
  anioIngresoLaboral?: number;

  @IsOptional()
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
