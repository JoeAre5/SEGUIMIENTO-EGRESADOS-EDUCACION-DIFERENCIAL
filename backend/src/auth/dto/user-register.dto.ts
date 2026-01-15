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

  // ✅ AHORA opcional: si no viene, Prisma usa @default(Docente)
  @IsOptional()
  @IsEnum(ROLE, { message: 'El rol proporcionado no es válido' })
  role?: ROLE;

  // ✅ NUEVO: para asociar Usuario EGRESADO con un estudiante
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
