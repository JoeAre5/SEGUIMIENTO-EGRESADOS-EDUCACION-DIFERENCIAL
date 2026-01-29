import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UpdateEgresadoDto {

  @IsOptional()
  @IsString()
  fechaEgreso?: string;


  @IsOptional()
  @IsInt()
  anioFinEstudios?: number;


  @IsOptional()
  @IsString()
  @IsIn(['Trabajando', 'Cesante', 'Otro'])
  situacionActual?: string;


  @ValidateIf((o) => o.situacionActual === 'Otro')
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

  @IsOptional()
  @IsString()
  @IsIn([
    'Sueldo mínimo ($500.000)',
    'Entre $500.001 y $1.000.000',
    'Entre $1.000.001 y $1.500.000',
    'Más de $1.500.001',
  ])
  nivelRentas?: string;

  @IsOptional()
  @IsString()
  @IsIn(['PSU/PAES', 'CFT', 'PACE', 'Propedéutico', 'Otro'])
  viaIngreso?: string;

  @ValidateIf((o) => o.viaIngreso === 'Otro')
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
  @IsString()
  @MaxLength(120)
  tipoEstablecimientoOtro?: string;


  @IsOptional()
  anioIngresoLaboral?: number;

  @IsOptional()
  anioSeguimiento?: number;


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
