import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
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

  @IsNotEmpty()
  @IsEnum(ROLE, { message: 'El rol proporcionado no es válido' })
  role: ROLE;

  @IsNotEmpty()
  @IsString()
  password: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  nombreCompleto: string;
}
