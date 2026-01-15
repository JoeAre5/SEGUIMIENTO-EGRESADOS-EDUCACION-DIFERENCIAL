import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateEgresadoDto {
  @IsInt()
  idEstudiante: number;

  // ✅ Ya NO se exige (y en el formulario ya no va)
  @IsOptional()
  @IsString()
  fechaEgreso?: string;

  // ✅ Solo estas 3 opciones
  @IsNotEmpty()
  @IsString()
  @IsIn(['Trabajando', 'Cesante', 'Otro'])
  situacionActual: string;

  // ✅ Si selecciona "Otro", debe especificar
  @ValidateIf((o) => o.situacionActual === 'Otro')
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  situacionActualOtro?: string;

  // (Los siguientes quedan opcionales por ahora; luego los vamos ajustando al nuevo formulario)
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

  // ✅ Ya no van en el formulario, pero los dejamos opcionales por compatibilidad
  @IsOptional()
  anioIngresoLaboral?: number;

  @IsOptional()
  anioSeguimiento?: number;

  // ✅ Contacto
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  // Si en tu formulario el correo es obligatorio (en tus imágenes tiene *),
  // cámbialo a @IsNotEmpty() + @IsEmail() (te lo dejo así recomendado):
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(120)
  emailContacto: string;

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
