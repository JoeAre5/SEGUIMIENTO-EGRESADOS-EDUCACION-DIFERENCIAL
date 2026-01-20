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

  // ✅ NUEVO (formulario): año de finalización (obligatorio en UI)
  @IsNotEmpty()
  @IsInt()
  anioFinEstudios: number;

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

  @IsOptional()
  @IsString()
  empresa?: string;

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsOptional()
  sueldo?: number;

  // ✅ requerido en UI (pero lo dejamos como estaba: opcional en DTO)
  @IsOptional()
  @IsString()
  @IsIn([
    'Sueldo mínimo ($500.000)',
    'Entre $500.001 y $1.000.000',
    'Entre $1.000.001 y $1.500.000',
    'Más de $1.500.001',
  ])
  nivelRentas?: string;

  // ✅ NUEVOS CAMPOS (formulario)
  @IsOptional()
  @IsString()
  @IsIn(['PSU/PAES', 'CFT', 'PACE', 'Propedéutico', 'Otro'])
  viaIngreso?: string;

  @ValidateIf((o) => o.viaIngreso === 'Otro')
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  viaIngresoOtro?: string;

  @IsOptional()
  anioIngresoCarrera?: number;

  @IsOptional()
  @IsString()
  @IsIn(['Femenino', 'Masculino', 'Prefiero no decirlo'])
  genero?: string;

  @IsOptional()
  @IsString()
  @IsIn([
    'Menos de 2 meses',
    'Entre 2 a 6 meses',
    'Entre 6 meses y 1 año',
    'Más de 1 año',
    'No he encontrado trabajo',
  ])
  tiempoBusquedaTrabajo?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Público', 'Privado', 'Otro'])
  sectorLaboral?: string;

  @ValidateIf((o) => o.sectorLaboral === 'Otro')
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  sectorLaboralOtro?: string;

  @IsOptional()
  @IsString()
  @IsIn([
    'Del Estado',
    'Particular subvencionado',
    'Particular',
    'No aplica',
    'Otro',
  ])
  tipoEstablecimiento?: string;

  @ValidateIf((o) => o.tipoEstablecimiento === 'Otro')
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  tipoEstablecimientoOtro?: string;

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
