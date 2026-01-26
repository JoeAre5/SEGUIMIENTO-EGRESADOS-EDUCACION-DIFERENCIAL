import { IsEnum } from 'class-validator';
import { RoleDto } from './create-usuario-admin.dto';

export class UpdateRoleDto {
  @IsEnum(RoleDto)
  role: RoleDto;
}
