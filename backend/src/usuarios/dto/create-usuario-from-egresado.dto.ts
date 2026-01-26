import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { RoleDto } from './create-usuario-admin.dto';

export class CreateUsuarioFromEgresadoDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEmail()
  email: string;

  @IsString()
  nombreCompleto: string;

  // opcional, por defecto EGRESADO
  @IsOptional()
  @IsEnum(RoleDto)
  role?: RoleDto;
}
