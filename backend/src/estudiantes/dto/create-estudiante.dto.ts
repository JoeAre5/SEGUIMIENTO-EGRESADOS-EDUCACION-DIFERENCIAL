import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateEstudianteDto {
  @IsString()
  @IsNotEmpty()
  rut: string;

  @IsString()
  @IsNotEmpty()
  nombre: string; // ✅ nuevo

  @IsString()
  @IsNotEmpty()
  apellido: string; // ✅ nuevo

  @IsString()
  @IsNotEmpty()
  nombreSocial: string; // ✅ requerido en tu prisma

  @IsInt()
  @Min(1900)
  agnioIngreso: number;

  @IsInt()
  idPlan: number;
}
