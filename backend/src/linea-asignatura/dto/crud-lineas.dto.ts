import { IsHexColor, IsNotEmpty, IsString } from 'class-validator';

export class UpdateLineaDTO {
  @IsNotEmpty()
  @IsString()
  tituloLineaNuevo: string;

  @IsNotEmpty()
  @IsHexColor()
  color: string;
}

export class CrearLineaDTO {
  @IsNotEmpty()
  @IsString()
  tituloLineaNuevo: string;

  @IsNotEmpty()
  @IsHexColor()
  color: string;
}
