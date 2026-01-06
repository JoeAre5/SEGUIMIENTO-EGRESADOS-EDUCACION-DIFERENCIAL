import { Asignatura, LineaAsignatura } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class ActualizarDatosLineaDTO {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true, always: true })
  @Type(() => LineasActualizadas)
  @ArrayMinSize(1)
  lineasNuevas: LineasActualizadas[];
}

export class LineasActualizadas {
  @IsOptional()
  @IsString()
  tituloLineaRelacionada?: LineaAsignatura['titulo'];

  @IsOptional()
  @IsString()
  @ValidateIf((obj) => obj.tituloLineaRelacionada)
  tituloNuevo?: LineaAsignatura['titulo'];

  @IsOptional()
  @IsHexColor()
  @ValidateIf((obj) => obj.tituloLineaRelacionada)
  colorNuevo?: LineaAsignatura['color'];

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => String)
  @Matches(/^[A-Z]{2,3}\d{3}$/, {
    each: true,
    message:
      'El código debe tener de dos a tres letras mayúsculas seguido de tres numeros',
  })
  @Length(5, 6, { each: true })
  codigosAsignaturas: Asignatura['codigo'][];
}
