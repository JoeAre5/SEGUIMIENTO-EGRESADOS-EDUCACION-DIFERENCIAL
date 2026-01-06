import { Component } from '@angular/core';
import { AlumnoService } from '../../services/alumno.service';
import { CommonModule, Location } from '@angular/common';
import { DetallesPracticaDTO } from '../../models/practica';
import { AccordionModule } from 'primeng/accordion';
import { InfoPracticaDTO } from '../../models/practica';
import { ActivatedRoute, Router } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
@Component({
  selector: 'app-practicas-estudiante',
  standalone: true,
  imports: [CommonModule, AccordionModule, SkeletonModule, PaginatorModule, ProgressSpinnerModule],
  templateUrl: './practicas-estudiante.component.html',
  styleUrl: './practicas-estudiante.component.css',
})
export class PracticasEstudianteComponent {
  // Fixme : Cambiar por id pasada por la vista anterior
  id_estudiante: number = 0;
  practicas_estudiante: DetallesPracticaDTO = new DetallesPracticaDTO();
  tiposPracticas: Practicas[] = [];
  nombreEstudiante: String = '';
  rutEstudiante: String = '';
  cargando: boolean = true;

  practicasPorPagina: number = 3;
  practicasTotales: number = 0;
  paginaActual: number = 1;

  constructor(
    private readonly alumnoService: AlumnoService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {
  }

  // Antes que se carge el componente
  ngOnInit() {
    // Se obtienen los parametros de la ruta
    this.obtenerParametrosDeLaRuta();
    console.log(this.id_estudiante)
    this.alumnoService
      .getPracticasAlumno(this.id_estudiante.toString())
      .subscribe((request) => {
        this.practicas_estudiante = request;
        console.log(this.practicas_estudiante)
      });

    setTimeout(() => {
      this.cargando = false;
    }, 1000);

    this.tiposPracticas = this.getMatrizDePracticas();
    console.log(this.tiposPracticas);
  }

  public verDetallesPractica(titulo: string) {
    this.router.navigate(['/practica-detalle', titulo])
  }

  getMatrizDePracticas() {
    let tipoPractica: Practicas[] = [];
    this.practicas_estudiante.practicas.forEach((practica) => {
      let practicasTipo: Practicas = {
        practicas: [],
        tipoPractica: practica.posicionRelativa,
      };
      this.practicas_estudiante.practicas.forEach((p) => {
        if (p.posicionRelativa === practicasTipo.tipoPractica) {
          practicasTipo.practicas.push(p);
        }
      });
      tipoPractica.push(practicasTipo);
    });
    return tipoPractica;
  }

  public devolverAMenuEstudiante() {
    this.location.back();
  }

  /**
   * Funcion que obtiene los parametros enviados de la vista anterior
   * La vista anterior enviar la siguiente ruta [practicas-estudiantes/:idEstudiante]
   */
  public obtenerParametrosDeLaRuta() {
    this.route.params.subscribe((param) => {
      this.id_estudiante = param['idEstudiante'];
    });
  }

  public onCambioDePagina(evento: any) {
    this.paginaActual = evento.page + 1;
    this.practicasPorPagina = evento.rows;
  }

  public obtenerPracticasPaginadas(): InfoPracticaDTO[] {
    const indiceInicial = (this.paginaActual - 1) * this.practicasPorPagina;
    const indiceFinal = indiceInicial + this.practicasPorPagina;
    const practicasPaginadas: InfoPracticaDTO[] =
      this.practicas_estudiante.practicas.slice(indiceInicial, indiceFinal);
    return practicasPaginadas;
  }

  public obtenerCantidadTotalPracticas() {
    return this.practicas_estudiante.practicas.length;
  }
}
interface Practicas {
  tipoPractica: number;
  practicas: InfoPracticaDTO[];
}
