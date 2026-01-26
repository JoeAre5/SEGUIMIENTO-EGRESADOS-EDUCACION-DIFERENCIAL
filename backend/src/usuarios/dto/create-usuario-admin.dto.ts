import { IsEmail, IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export enum RoleDto {
  Administrador = 'Administrador',
  JC = 'JC',
  CoordinadorPractica = 'CoordinadorPractica',
  Secretario = 'Secretario',
  Docente = 'Docente',
  EGRESADO = 'EGRESADO',
}

export class CreateUsuarioAdminDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  nombreCompleto: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(RoleDto)
  role: RoleDto;

  // opcional: para vincular cuenta a un Estudiante (egresado)
  @IsOptional()
  @IsInt()
  idEstudiante?: number;
}
