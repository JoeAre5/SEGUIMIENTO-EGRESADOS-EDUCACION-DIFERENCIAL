import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { DiagnosticosService } from '../../services/diagnosticos.service';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { FormsModule } from '@angular/forms';
import { CursosService } from '../../services/Cursos.service';
import { AprobacionCursoDTO } from '../../models/Curso.dto';
import { AsignaturaDetalleDTO } from '../../models/asignatura.dto';


Chart.register(ChartDataLabels);

@Component({
  selector: 'app-aprobacion-curso',
  standalone: true,
  imports: [CommonModule, ChartModule, FormsModule],
  templateUrl: './aprobacion-curso.component.html',
  styleUrl: './aprobacion-curso.component.css',
})
export class AprobacionCursoComponent {
  constructor(
    private route: ActivatedRoute,
    private diagnosticosService: DiagnosticosService,
    private cursosService: CursosService,
    private router: Router
  ) {}

  ngOnInit() {
    //guardamos el id del fluxograma y el codigo de la asignatura de la ruta
    this.idFluxograma = +this.route.snapshot.paramMap.get('idFluxograma')!
    this.codigoAsignatura = this.route.snapshot.paramMap.get('codigoAsignatura')!
    //llamamos a las funciones para obtener el nombre de la asignatura y las aprobaciones del curso
    this.obtenerNombreAsignatura()
    this.obtenerAprobaciones()
  }

  //esta variable guarda el codigo de la asignatura
  public codigoAsignatura: string = ''
  //esta variable guarda el id del fluxograma
  public idFluxograma: number = 0
  //esta variable guarda el detalle de la asignatura
  public asignatura: AsignaturaDetalleDTO={
    areaFormacion:'',
    codigoAsignatura: '',
    idAsignatura: 0,
    nombreAsignatura: '',
    nombreCortoAsignatura: '',
    planes: [],
    semestreRealizacion: 0
  }
  //esta variable guarda las aprobaciones que tuvo un cohorte en un plan y un año
  public aprobacionesCohorte: AprobacionCursoDTO[]=[]
  //esta variable guarda los cohortes para el filtrador
  public cohortes: number[]=[]
  //esta variable guarda el cohorte seleccionado en el filtrador
  public cohorteSeleccionado: number | '' = ''
  //esta variable guarda todos los graficos con su label y sus datos
  public graficos: any[] = []
  //esta variable guarda los años para el filtrador
  public anios: number[]=[]
  //esta variable guarda el año seleccionado en el filtrador
  public anioSeleccionado: number | ''=''
  //esta variable es el inicializador para el tiempo de carga
  public cargando: boolean= true
  //esta funcion guarda las opciones del grafico
  public opcionesGrafico: any = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
          font: {
            weight: 'bold',
            size: 14,
            family: 'Arial, sans-serif',
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            return `${tooltipItem.label}: ${tooltipItem.raw}%`
          },
        },
      },
      datalabels: {
        color: 'white',
        formatter: (value: number) => {
          return `${value}%`
        },
        font: {
          weight: 'bold',
          size: 16,
        },
        anchor: 'center',
        align: 'center',
      },
    },
    legend: {
      position: 'top',
      labels: {
        boxWidth: 20,
      },
    },
  }

  //esta funcion va a buscar la asignatura con el codigo para guardarla y despues mostrar su nombre en el titulo
  public obtenerNombreAsignatura() {
    this.diagnosticosService.obtenerNombreAsignatura(this.codigoAsignatura).subscribe((asignatura) => {
      this.asignatura = asignatura
    })
  }

  //esta funcion va a buscar las aprobaciones con el codigo de la asignatura y crea los graficos de forma dinamica
  public obtenerAprobaciones() {
    //vamos a buscar las aprobaciones
    this.cursosService.aprobacionPorCurso(this.codigoAsignatura).subscribe((respuesta) => {
      //se guardan las aprobaciones
      this.aprobacionesCohorte = respuesta
      //se crea un tiempo para cargar datos
      this.cargando = true
      setTimeout(() => {
        this.cargando = false
      }, 1000)
      //guardamos los cohortes y años de forma unica para el filtrador
      this.cohortes = [...new Set(respuesta.map((item) => item.cohorte))].sort()
      this.anios = [...new Set(respuesta.map((item) => item.agnioRendicion))].sort()

      //aplicamos los filtros y guardamos las aprobaciones
      let cursosFiltrados: AprobacionCursoDTO[] = this.filtrarAprobaciones()

      //comprobamos si existen aprobaciones
      if (cursosFiltrados.length > 0) {
        //usamos reduce para agrupar por plan
        this.graficos = cursosFiltrados.reduce((acc: any[], curso) => {
          //buscamos si hay otra aprobacion con el mismo plan
          const index = acc.findIndex((item) => item.plan === curso.tituloPlan)
  
          if (index === -1) {
            //si no existe agregamos los datos del curso
            acc.push({
              plan: curso.tituloPlan,
              totalAprobacion: curso.aprobacionAnual,
              totalCursos: 1,
            })
          } else {
            //si ya existe aumentamos
            acc[index].totalAprobacion += curso.aprobacionAnual
            acc[index].totalCursos++
          }
          //devolvemos el acumulador
          return acc
        //mapeamos los datos para darle el formato del grafico
        }, []).map((item) => {
          //calculamos las aprobaciones promedio
          const aprobacionPromedio = Math.round(item.totalAprobacion / item.totalCursos)
          //calculamos las reprobaciones promedio
          const reprobacionPromedio = Math.round(100 - aprobacionPromedio)
          //devolvemos los datos para el grafico, de titulo el plan y los graficos con aprobacion en verde y reprobacion en rojo
          return {
            plan: item.plan,
            data: {
              labels: ['Aprobación', 'Reprobación'],
              datasets: [
                {
                  data: [aprobacionPromedio, reprobacionPromedio],
                  backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                  ],
                },
              ],
            },
          }
        })
      }
    })
  }

  //esta funcion filtra las aprobaciones
  public filtrarAprobaciones(){
    //creamos un arreglo vacio para guardar las aprobaciones
    let cursosFiltrados: AprobacionCursoDTO[] = []
    //vemos si se escogio un cohorte
    if (this.cohorteSeleccionado === ''){
      //vemos si se escogio un año
      if(this.anioSeleccionado === ''){
        //si no se escogio un año y no se escogio un cohorte se mandan sin filtrar las aprobaciones
        cursosFiltrados= this.aprobacionesCohorte
      }else{
        //si se escogio un año pero no un cohorte se hace un filtro por el año seleccionado
        cursosFiltrados = this.aprobacionesCohorte.filter(cohorte=>cohorte.agnioRendicion===Number(this.anioSeleccionado))
      }
    }else{
      //vemos si se escogio un año
      if(this.anioSeleccionado === ''){
        //si se escogio un cohorte pero no un año se hace un filtro por el cohorte seleccionado
        cursosFiltrados = this.aprobacionesCohorte.filter((cohortes) => cohortes.cohorte === Number(this.cohorteSeleccionado))
      }else{
        //si se escogio un cohorte y un año se ha un filtro considerando el cohorte y el año seleccionado
        cursosFiltrados = this.aprobacionesCohorte.filter((cohortes) => cohortes.cohorte === Number(this.cohorteSeleccionado) && cohortes.agnioRendicion === Number(this.anioSeleccionado))
      }
    }
    //devolvemos las aprobaciones despues de comprobar los filtros
    return cursosFiltrados
  }

  //esta funcion devuelve al fluxograma
  public devolverAlFluxograma() {
    this.router.navigate(['/fluxograma',this.idFluxograma])
  }
}
