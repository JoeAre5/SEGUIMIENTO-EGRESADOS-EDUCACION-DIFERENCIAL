import { ValidateIf, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UserLoginDTO {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @ValidateIf((obj) => !obj.email)
  @IsString()
  username?: string;

  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsNotEmpty()
  @ValidateIf((obj) => !obj.username)
  @IsEmail({}, { message: 'email must be valid' })
  email?: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
