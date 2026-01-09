import { IsOptional, IsString, IsInt, IsNumber } from 'class-validator';

export class UpdateEgresadoDto {
  @IsOptional()
  @IsString()
  fechaEgreso?: string; // ✅ agregado

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
  @IsNumber()
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
