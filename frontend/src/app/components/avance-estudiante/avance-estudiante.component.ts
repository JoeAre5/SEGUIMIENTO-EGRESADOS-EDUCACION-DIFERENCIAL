import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DividerModule } from 'primeng/divider';
import { AlumnoAvance } from '../../models/alumno-avance';
import { AlumnoService } from '../../services/alumno.service';
import { CursoRealizado } from '../../models/curso_realizado';
import { ScrollerModule } from 'primeng/scroller';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'chart.js';

Chart.register(ChartDataLabels);
@Component({
  selector: 'app-avance-estudiante',
  standalone: true,
  imports: [
    CommonModule,
    ChartModule,
    DividerModule,
    ScrollerModule,
    FormsModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './avance-estudiante.component.html',
  styleUrl: './avance-estudiante.component.css',
})
export class AvanceEstudianteComponent {
  /**
   * Esta vista presenta la informacion de avance estudiantil de un estudiante en especifico
   *
   * Se llama al servicio AlumnoService para que pueda inyectar el servicio con la
   * informacion recibida del backend.
   *
   * Se debe obtener el @param idEstudiante para poder acceder a esta vista
   */

  // se define la estructura de dato que almacena la informacion de avance del estudiante
  avanceEstudiante: AlumnoAvance = new AlumnoAvance();
  // se almacenan los cursos que se busca en el input de la vista
  cursosBuscados: CursoRealizado[] = [];
  // variable que almacena la busqueda del input de buscar cursos
  entradaBuscador: string = '';
  // informacion que muestra el grafico de linea
  informacion_grafico: any;
  // opciones del grafico de lineas
  configuracion_grafico: any;
  // id del estudiante obtenido de la ruta
  idEstudiante: number = 0;

  cargando: boolean = true

  constructor(
    private readonly alumnoService: AlumnoService,
    private route: ActivatedRoute,
    private location: Location
  ) {
    this.obtenerParametrosDeLaRuta();
  }

  ngOnInit() {
    // Se obtienen los datos del servicio
    this.alumnoService
      .getAvanceEstudiante(this.idEstudiante.toString())
      .subscribe(
        (avance) => {
          this.avanceEstudiante = avance;
          this.establecerGrafico();
          this.cargando = false
        },
        (error) => {
          console.error('Error al obtener los datos del estudiante', error);
        }
      );
  }

  public filtrarCursos() {
    if (!this.entradaBuscador) {
      return this.avanceEstudiante.cursosRealizados;
    }
    const str = this.entradaBuscador.toLowerCase();
    return this.avanceEstudiante.cursosRealizados.filter(
      (curso) =>
        curso.nombreAsignatura.toLowerCase().includes(str) ||
        curso.codigo.toLowerCase().includes(str)
    );
  }

  public establecerGrafico() {
    const estiloDelDocumento = getComputedStyle(document.documentElement);
    const colorTexto = estiloDelDocumento.getPropertyValue('--text-color');
    const colorBorde = estiloDelDocumento.getPropertyValue('--surface-border');

    let semestres_individual: String[] =
      this.avanceEstudiante.avanceIndividual.map(
        (sem) => `Semestre ${sem.numSemestre}`
      );
    let promedios_individual: String[] =
      this.avanceEstudiante.avanceIndividual.map((sem) =>
        // Para redondear el promedio
        sem.promedio.toFixed(1)
      );
    let promedios_cohorte: String[] = this.avanceEstudiante.avanceCohorte.map(
      (sem) => sem.promedio.toFixed(1)
    );

    this.establecerDatosDelGrafico(
      semestres_individual,
      promedios_individual,
      promedios_cohorte,
      estiloDelDocumento
    );

    this.establecerConfiguracionDelGrafico(colorTexto, colorBorde);
  }

  public devolverAMenuEstudiante() {
    this.location.back();
  }

  /**
   * Funcion que obtiene los parametros de la ruta anterior
   * En este caso la vista anterior enviaria a la ruta [avance-estudiante/:idEstudiante]
   */
  public obtenerParametrosDeLaRuta() {
    this.route.params.subscribe((param) => {
      this.idEstudiante = param['idEstudiante'];
    });
  }

  /**
   * Funcion para establecer los informacion/datos del grafico de linea, se le pasa los datos del estudiante individual (promedio por semestre)
   * y promedios de su cohorte.
   *
   * @param {String[]} semestres_individual     El nombre de cada semestres que el alumno ha cursado
   * @param {String[]} promedios_individual     Los promedios de cada semestre del estudiante
   * @param {String[]} promedios_cohorte        Los promedios por cada semestre del cohorte del estudiante
   * @param {CSSStyleDeclaration} documentStyle Estilo del documento
   */
  public establecerDatosDelGrafico(
    semestres_individual: String[],
    promedios_individual: String[],
    promedios_cohorte: String[],
    documentStyle: CSSStyleDeclaration
  ) {
    this.informacion_grafico = {
      labels: semestres_individual,
      datasets: [
        {
          label: 'Avance individual',
          fill: '1',
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          pointRadius: 4,
          pointHoverRadius: 4,
          yAxisID: 'y',
          tension: 0.2,
          data: promedios_individual,
          pointBorderColor: documentStyle.getPropertyValue('--blue-500'),
          pointBackgroundColor: documentStyle.getPropertyValue('--blue-500'),
          datalabels: {
            color: documentStyle.getPropertyValue('--blue-500'),
            align: 'top',
            offset: 20,
            font: {
              size: 15,
            },
          },
        },
        {
          label: `Avance por cohorte ${this.avanceEstudiante.estudiante.agnioIngreso}`,
          fill: '-1',
          borderColor: '#DC911A',
          pointRadius: 4,
          pointHoverRadius: 4,
          yAxisID: 'y',
          tension: 0.2,
          data: promedios_cohorte,
          pointBorderColor: '#DC911A',
          pointBackgroundColor: '#DC911A',
          datalabels: {
            color: '#DC911A',
            align: 'bottom',
            offset: 20,
            font: {
              size: 15,
            },
          },
        },
      ],
    };
  }

  /**
   * Funcion para establecer configuracion del grafico de lineas, como por ejemplo el color de las lineas tamagno de letras,
   * y tambien uso de plugins para mostrar los promedios
   *
   * @param {string} textColor      color del texto del documento
   * @param {string} surfaceBorder  color del borde del documento
   */
  public establecerConfiguracionDelGrafico(
    textColor: string,
    surfaceBorder: string
  ) {
    this.configuracion_grafico = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor,
            font: {
              size: 12,
              weight: 'bold',
            },
          },
        },
        tooltip: {
          enabled: true,
          mode: 'index',
        },
        datalabels: {
          display: true,
        },
        title: {
          display: true,
          text: 'Avance Estudiantil por Semestre',
          font: {
            size: 18,
            weight: 'bold',
          },
          color: textColor,
          padding: {
            bottom: 10,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColor,
            font: {
              size: 12,
            },
          },
          grid: {
            color: surfaceBorder,
          },
          title: {
            display: true,
            text: 'Semestres',
            color: textColor,
            font: {
              size: 16,
            },
          },
        },
        y: {
          ticks: {
            color: textColor,
            font: {
              size: 16,
            },
          },
          grid: {
            color: surfaceBorder,
          },
          min: 1,
          max: 7,
          title: {
            display: true,
            text: 'Promedio',
            color: textColor,
            font: {
              size: 16,
            },
          },
        },
      },
    };
  }
}
