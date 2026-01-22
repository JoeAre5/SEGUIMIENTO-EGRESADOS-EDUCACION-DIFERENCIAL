import { IsBoolean } from 'class-validator';

export class ConsentimientoDto {
  @IsBoolean()
  acepta!: boolean;
}
