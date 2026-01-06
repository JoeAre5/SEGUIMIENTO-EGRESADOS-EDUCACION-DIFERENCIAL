import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { EgresadosService } from './egresados.service';
import { CreateEgresadoDto } from './dto/create-egresado.dto';
import { UpdateEgresadoDto } from './dto/update-egresado.dto';

@Controller('egresados')
export class EgresadosController {
  constructor(private readonly egresadosService: EgresadosService) {}

  @Post()
  create(@Body() dto: CreateEgresadoDto) {
  console.log("DTO RECIBIDO:", dto);
  return this.egresadosService.create(dto);
}


  @Get()
  findAll() {
    return this.egresadosService.findAll();
  }

  @Get(':idEstudiante')
  findOne(@Param('idEstudiante') idEstudiante: string) {
    return this.egresadosService.findOne(+idEstudiante);
  }

  @Patch(':idEgresado')
  update(
    @Param('idEgresado') idEgresado: string,
    @Body() dto: UpdateEgresadoDto,
  ) {
    return this.egresadosService.update(+idEgresado, dto);
  }
}
