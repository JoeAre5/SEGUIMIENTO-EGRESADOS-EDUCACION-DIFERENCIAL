import { IsEnum, IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';
import { ROLE } from '@prisma/client';

export class UserRegisterDTO {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  username: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  email: string;
  @IsOptional()
  @IsEnum(ROLE, { message: 'El rol proporcionado no es válido' })
  role?: ROLE;

  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === undefined || value === '' ? undefined : Number(value),
  )
  @IsInt()
  idEstudiante?: number;

  @IsNotEmpty()
  @IsString()
  password: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  nombreCompleto: string;
}
