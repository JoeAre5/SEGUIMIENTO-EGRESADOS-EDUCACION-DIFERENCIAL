import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUsuarioFromEgresadoDto {
  @IsString()
  username: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  nombreCompleto: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  role?: string;
}
