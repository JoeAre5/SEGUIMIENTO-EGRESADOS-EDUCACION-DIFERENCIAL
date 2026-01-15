import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UpdateEgresadoDto {
  // ✅ Ya NO se exige (y en el formulario ya no va)
  @IsOptional()
  @IsString()
  fechaEgreso?: string;

  // ✅ Solo estas 3 opciones (pero opcional en PATCH)
  @IsOptional()
  @IsString()
  @IsIn(['Trabajando', 'Cesante', 'Otro'])
  situacionActual?: string;

  // ✅ Si en el PATCH envían situacionActual="Otro", deben especificar
  @ValidateIf((o) => o.situacionActual === 'Otro')
  @IsString()
  @MaxLength(120)
  situacionActualOtro?: string;

  // Compatibilidad (aún no lo tocamos en el service, solo DTO)
  @IsOptional()
  @IsString()
  empresa?: string;

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsOptional()
  sueldo?: number;

  @IsOptional()
  @IsString()
  @IsIn([
    'Sueldo mínimo ($500.000)',
    'Entre $500.001 y $1.000.000',
    'Entre $1.000.001 y $1.500.000',
    'Más de $1.500.001',
  ])
  nivelRentas?: string;


  // ✅ Ya no van en el formulario, pero opcionales por compatibilidad
  @IsOptional()
  anioIngresoLaboral?: number;

  @IsOptional()
  anioSeguimiento?: number;

  // ✅ Contacto
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  emailContacto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  direccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  linkedin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  contactoAlternativo?: string;
}
