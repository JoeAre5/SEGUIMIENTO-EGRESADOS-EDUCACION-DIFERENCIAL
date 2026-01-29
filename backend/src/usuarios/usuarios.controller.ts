import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UsuariosService } from './usuarios.service';
import {
  CreateUsuarioAdminDto,
  CreateUsuarioFromEgresadoDto,
  UpdatePasswordDto,
  UpdateRoleDto,
  UpdateUsernameDto,
} from './dto';

@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller('usuarios')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Administrador')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Post()
  create(@Body() dto: CreateUsuarioAdminDto, @Req() req: any) {
    return this.usuariosService.create(dto);
  }

  @Post('from-egresado/:idEgresado')
  createFromEgresado(
    @Param('idEgresado', ParseIntPipe) idEgresado: number,
    @Body() dto: CreateUsuarioFromEgresadoDto,
  ) {
    return this.usuariosService.createFromEgresado(idEgresado, dto);
  }

  @Patch(':id/username')
  updateUsername(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsernameDto,
  ) {
    return this.usuariosService.updateUsername(id, dto);
  }

  @Patch(':id/password')
  updatePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.usuariosService.updatePassword(id, dto);
  }

  @Patch(':id/role')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
    @Req() req: any,
  ) {
    return this.usuariosService.updateRole(id, dto, req.user?.id);
  }


  @Patch(':id/active/:isActive')
  setActive(
    @Param('id', ParseIntPipe) id: number,
    @Param('isActive', ParseBoolPipe) isActive: boolean,
  ) {
    return this.usuariosService.setActive(id, isActive);
  }

  @Get('egresados/sin-cuenta')
  egresadosSinCuenta() {
    return this.usuariosService.egresadosSinCuenta();
  }
}
