import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { MultiSelectModule } from 'primeng/multiselect';
import { ReporteAsignaturaDTO } from '../../models/asignatura.dto';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { Router } from '@angular/router';
import { AsignaturaService } from '../../services/asignatura.service';

Chart.register(annotationPlugin)

@Component({
  selector: 'app-tendencias-asignatura-corte-practico',
  standalone: true,
  imports: [ReactiveFormsModule, ChartModule, CommonModule, FormsModule, MultiSelectModule, PaginatorModule],
  templateUrl: './tendencias-asignatura-corte-practico.component.html',
  styleUrls: ['./tendencias-asignatura-corte-practico.component.css']
})
export class TendenciasAsignaturaCortePracticoComponent implements OnInit {

  constructor(
    private asiganturasService: AsignaturaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    //llamamos al servicio para obtener los detalles de las asignaturas corte practico
    this.asiganturasService.obtenerDetalleAsignaturas().subscribe(respuesta=>{
      //guardamos los detalles de las asignaturas corte practico
      this.asignaturasCortePractico=respuesta
      //creamos un tiempo de espera
      this.cargando = true
      setTimeout(() => {
        this.cargando = false
      }, 1000)
      const planesUnicos = new Map()
      this.asignaturasCortePractico.flatMap(asignatura => asignatura.promedios.cohortes).forEach(plan => {
          if (!planesUnicos.has(plan.codigoPlan)) {
            planesUnicos.set(plan.codigoPlan, plan)
          }
        })

      const planes = Array.from(planesUnicos.values()).sort((a, b) => a.tituloPlan.localeCompare(b.tituloPlan))

      this.planes = planes.map(plan => ({
        label: plan.tituloPlan,
        value: plan.codigoPlan
      }))
      this.planesSeleccionados= [...this.planes]
      //guardamos de forma unica y ordenada los cohortes para el filtro de grafico barras y el resumen de asignatura
      this.cohortes = Array.from(new Set(this.asignaturasCortePractico.flatMap(asignatura=>asignatura.promedios.cohortes).map(cohorte=>cohorte.cohorte))).sort()
      //guardamos de forma unica y ordenada los semestres para el filtro de barras
      this.semestres = Array.from(new Set(this.asignaturasCortePractico.flatMap(asignatura=>asignatura.asignaturas).map(a => a.semestreRealizacion))).sort((a, b) => Number(a) - Number(b))
      //guardamos de forma unica y ordenada los cohortes para el filtrador multiple del grafico de lineas con el formato {label: string, value: number} 
      this.cohortesGraficoLineas = this.cohortes.sort().map(cohorte => ({ label: cohorte.toString(), value: cohorte }))
      this.cohortesGraficoBarras = this.cohortes.sort().map(cohorte => ({ label: cohorte.toString(), value: cohorte }))
      //guardamos los cohortes seleccionados para el grafico de lineas
      this.cohortesSeleccionadoGraficoLineas = [...this.cohortesGraficoLineas]
      //guardamos el cohorte seleccionado para el grafico de barras
      this.cohortesSeleccionadoGraficoBarras= [...this.cohortesGraficoBarras]
      //llamamos a la funcion para obtener los detalles de las asignaturas de corte practico
      this.obtenerDetallesDeAsignaturasDeCortePractico()
    })
  }

  public planes: {label: string; value: number}[]=[]
  public planesSeleccionados: {label: string; value: number}[]=[]
  //variable para guardar las asignaturas de corte practico
  public asignaturasCortePractico: ReporteAsignaturaDTO[]=[]
  //variable para guardar los cohortes para los filtros de grafico de barras y el resumen de asignatura
  public cohortes: number[]=[]
  //variable para guardar los cohortes para el filtro multiple grafico de lineas
  public cohortesGraficoLineas: {label: string; value: number}[] = []
  public cohortesGraficoBarras: {label: string; value: number}[] = []
  //variable para guardar los cohortes seleccionados en el filtro multiple del grafico de lineas
  public cohortesSeleccionadoGraficoLineas: {label: string; value: number}[] = []
  public cohortesSeleccionadoGraficoBarras: {label: string; value: number}[] = []
  //variable para guardar los datos para el grafico de lineas
  public datosGraficoDeLineas: any
  //variable para guardar los semestres para el filtrador del grafico de barras
  public semestres: number[]=[]
  //variable para guardar el cohorte seleccionado en el grafico de barras
  public cohorteSeleccionadoGraficoBarras: number=0
  //variable para guardar los datos para el grafico de barras
  public datosGraficoDeBarras: any
  //variable para guardar el semestre seleccionado en el filtrador del grafico de barras
  public semestreSeleccionadoTest: number | ''=''
  //variable para guardar los datos para el resumen de asignaturas
  public datosAgrupados: {
    nombreAsignatura: string;
    posicion: number;
    cohorte: number;
    codigoPlan: number;
    promedio: number;
    porcentajeAprobacion: number
  }[]=[]
  //variable para guardar los datos filtrados para el resumen de asignaturas
  public datosAgrupadosFiltrados: any[] = []
  //variable para guardar los datos paginados para el resumen de asignaturas
  public datosAgrupadosPaginados: any[] = []
  //variable para guardar el cohorte seleccionado en el filtrador del resumen de asignaturas
  public cohorteSeleccionado: string = ''
  //variable para indicar el primer registro en la pagina
  public inicio: number = 0
  //variable para indicar las filas que habran por pagina
  public filas: number = 5
  //variable para guardar la cantidad de asignaturas que hay
  public numeroAsignaturas: number= 0
  //variable para guardar el numero critico para el grafico de barras
  public corteAprobacion: number=90
  //variable para guardar el numero critico para el grafico de lineas
  public cortePromedios: number=4
  //variable para inicializar el tiempo de carga
  public cargando: boolean=true
  public labelsFiltrados: string[]=[]
  //variable para guardar las opciones del grafico de lineas
  public opcionesGraficoDeLineas = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 16
          }
        }
      },
      annotation: {
        annotations: {
          criticalZone: {
            type: 'box',
            xScaleID: 'x',
            yScaleID: 'y',
            yMin: 0,
            yMax: this.cortePromedios,
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        }
      },
      datalabels: {
        display: true,
        align: 'top', 
        font: {
          weight: 'bold', 
          size: 12, 
        },
        color: '#000', 
        backgroundColor: '#FFF',
        borderRadius: 3, 
        padding: 5, 
        borderColor: '#000', 
        borderWidth: 2, 
      }
    },
    scales: {
      x: {
        grid: {
          color: '#e0e0e0'
        },
        ticks: {
          font: {
            size: 24
          },
          padding: 10,
          maxRotation: 90,
          minRotation: 45
        },
        title: {
          display: true,
          text: 'Asignaturas',
          font: {
            size: 24
          }
        }
      },
      y: {
        min: 1,
        max: 7,
        ticks: {
          callback: function(value: number) {
            return value.toFixed(1)
          },
          font: {
            size: 16
          },
          grid: {
            color: '#e0e0e0'
          }
        },
        title: {
          display: true,
          text: 'Notas',
          font: {
            size:24
          }
        },
        suggestedMin: 0,
        suggestedMax: 7
      }
    },
    backgroundColor: '#ffffff'
  }
  //variable para guardar las opciones del grafico de barras
  public opcionesGraficoDeBarras = {
    responsive: true,
    plugins: {
      legend: {
        display: true, 
        labels: {
          usePointStyle: true,
          color: '#000', 
          boxWidth: 0,
          font: {
            size: 24
          }
        }
      },
      datalabels: {
        display: true,
        color: 'white',
        align: 'center',
        font: {
          weight: 'bold',
          size: 16
        },
        backgroundColor: 'black',
        borderRadius: 4,
        padding: 6,
        borderColor: 'white',
        borderWidth: 2,
        clip: true
      }
    },
    scales: {
      x: {
        grid: {
          color: '#e0e0e0'
        },
        ticks: {
          font: {
            size: 24
          },
          padding: 10,
          maxRotation: 90,
          minRotation: 45
        },
        title: {
          display: true,
          text: 'Asignaturas',
          font: {
            size: 24
          }
        }
      },
      y: {
        min: 0,
        max: 100, 
        ticks: {
          stepSize: 10,
          callback: function(value: number) {
            return value.toFixed(0)
          },
          font: {
            size: 16
          },
          grid: {
            color: '#e0e0e0'
          }
        },
        title: {
          display: true,
          text: 'Porcentaje Aprobación',
          font: {
            size: 24
          }
        }
      }
    },
    backgroundColor: '#ffffff'
  }

  //funcion para volver al menu
  public volverAlMenu(){
    this.router.navigateByUrl('/menu')
  }

  //funcion para actualizar valores al cambiar de pagina
  public cambioDePagina(event: PaginatorState) {
    //se actualiza el primer registro que se va a mostrar, si no existe se pone 0 por defecto
    this.inicio = event.first ?? 0
    //actualiza las filas de registros que se van a mostrar, si no existe se pone 5 por defecto
    this.filas = event.rows ?? 5
    //se llama a la funcion para actualizar los datos
    this.actualizarDatosPaginados()
  }

  //esta funcion actualiza los datos que se van a mostrar por pagina
  public actualizarDatosPaginados() {
    //establecemos el inicio y el final de los datos que vamos a mostrar
    const inicio = this.inicio
    const final = this.inicio + this.filas
    //guardamos los datos que estan en el rango que queremos mostrar
    this.datosAgrupadosPaginados = this.datosAgrupadosFiltrados.slice(inicio, final)
  }

  //esta funcion aplica el filtro de cohorte al resumen de asignaturas
  public aplicarFiltroCohorte(): void {
    //comprobamos si se selecciono un cohorte
    if (this.cohorteSeleccionado) {
      //si se selecciono un cohorte se hace un filtro y guardamos los datos que correspondan al cohorte seleccionado
      this.datosAgrupadosFiltrados = this.datosAgrupados.filter(item => item.cohorte === +this.cohorteSeleccionado)
    } else {
      //si no se selecciono un cohorte se mantienen los mismos datos
      this.datosAgrupadosFiltrados = [...this.datosAgrupados]
    }
    //se actualiza el numero de asignaturas despues de aplicar el filtro
    this.numeroAsignaturas=this.datosAgrupadosFiltrados.length
    this.inicio=0
    this.actualizarDatosPaginados()
  }

  //esta funcion calcula el porcentaje de aprobacion para el resumen de asignaturas
  public calcularPorcentajeAprobacion(cohorteAprobaciones: { [cohorte: string]: number[] } = {}, cohorte: string): number {
    //creamos la aprobacion por cohorte en 0
    let aprobacionCohorte=0
    //obtenemos todas las aprobacion del cohorte que nos entreguen
    const aprobaciones= cohorteAprobaciones[cohorte]
    //sumamos todas las aprobaciones y las dividimos por la cantidad de aprobaciones
    aprobacionCohorte= parseFloat((aprobaciones.reduce((acc, aprobacion)=>acc+aprobacion,0)/aprobaciones.length).toFixed(2))
    //devolvemos el porcentaje de aprobacion del cohorte
    return aprobacionCohorte
  }

  //esta funcion obtiene los detalles de las asignaturas de corte practico para mostrar en los graficos de linea y de barras, y el resumen de asignatura
  public obtenerDetallesDeAsignaturasDeCortePractico() {
    //llamamos a la funcion para obtener los datos del resumen de asignaturas
    this.obtenerResumenAsignaturas()
    //llamamos a la funcion para obtener los datos para el grafico de lineas
    this.obtenerDatosGraficoDeLineas()
    //llamamos a la funcion para obtener los datos para el grafico de barras
    this.obtenerDatosGraficoDeBarras()
  }

  //esta funcion obtiene los datos para el resumen de asignaturas y haciendo los calculos para los promedios y aprobaciones por cada cohorte
  public obtenerResumenAsignaturas() {
    this.datosAgrupados = []
    const planesFiltrados = this.planesSeleccionados.map(plan => plan.value)
  
    // Usamos un Set para evitar duplicados
    const keysUnicas = new Set<string>()
  
    this.asignaturasCortePractico.forEach(asignatura => {
      const cohortePromedios: { [key: string]: number[] } = {}
      const cohorteAprobaciones: { [key: string]: number[] } = {}
  
      asignatura.promedios.cohortes.forEach(cohorte => {
        if (planesFiltrados.length === 0 || planesFiltrados.includes(cohorte.codigoPlan)) {
          const key = `${cohorte.cohorte}-${cohorte.codigoPlan}`
          if (!cohortePromedios[key]) {
            cohortePromedios[key] = []
          }
          cohortePromedios[key].push(cohorte.promedioAnual)
        }
      })
  
      asignatura.aprobaciones.cohortes.forEach(cohorte => {
        const key = `${cohorte.cohorte}-${cohorte.codigoPlan}`
        if (planesFiltrados.length === 0 || planesFiltrados.includes(cohorte.codigoPlan)) {
          if (!cohorteAprobaciones[key]) {
            cohorteAprobaciones[key] = []
          }
          cohorteAprobaciones[key].push(cohorte.aprobacionAnual)
        }
      })
  
      Object.keys(cohortePromedios).forEach(key => {
        const [cohorte, codigoPlan] = key.split('-').map(Number)
        const promedios = cohortePromedios[key]
        const promedioCohorte = parseFloat(
          (promedios.reduce((acc, promedio) => acc + promedio, 0) / promedios.length).toFixed(2)
        )
        const porcentajeAprobacion = this.calcularPorcentajeAprobacion(cohorteAprobaciones, key)
  
        // Evitar duplicados
        const uniqueKey = `${asignatura.asignaturas.idAsignatura}-${cohorte}-${codigoPlan}`
        if (!keysUnicas.has(uniqueKey)) {
          keysUnicas.add(uniqueKey)
          const datoCohorte = {
            nombreAsignatura: asignatura.asignaturas.nombreAsignatura,
            posicion: asignatura.asignaturas.semestreRealizacion,
            cohorte: cohorte,
            codigoPlan: codigoPlan,
            promedio: promedioCohorte,
            porcentajeAprobacion: porcentajeAprobacion,
          }
          this.datosAgrupados.push(datoCohorte)
        }
      })
    })
  
    this.aplicarFiltroCohorte()
    this.actualizarDatosPaginados()
  }

  //esta funcion crea un color random
  public colorRandom() {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }

  //esta funcion obtiene los datos para el grafico de barras
  public obtenerDatosGraficoDeBarras() {
    const planesFiltrados = this.planesSeleccionados.map(plan => plan.value)
    const cohortesFiltrados = this.cohortesSeleccionadoGraficoBarras.map(c => c.value)
    const coloresPorCohorte: { [key: number]: string } = {}
    cohortesFiltrados.forEach(cohorte => {
      coloresPorCohorte[cohorte] = this.colorRandom()
    });
  
    // Filtrar asignaturas por semestre, sin filtrar por cohorte aquí
    const asignaturasFiltradas = this.asignaturasCortePractico.filter(asignatura => {
      return (
        !this.semestreSeleccionadoTest ||
        asignatura.asignaturas.semestreRealizacion === Number(this.semestreSeleccionadoTest)
      )
    })
  
    // Obtener nombres únicos de las asignaturas
    const separarAsignaturas = Array.from(
      new Set(this.asignaturasCortePractico.flatMap(asignatura => asignatura.asignaturas.nombreAsignatura))
    )
  
    const asignaturasVisibles = new Set<string>() 

    // Crear datasets para cada cohorte seleccionado
    const datasets = cohortesFiltrados.map(cohorte => {
      const datosPorAsignatura = separarAsignaturas.map(asignatura => {
        const aprobaciones = asignaturasFiltradas
          .filter(a => a.asignaturas.nombreAsignatura === asignatura)
          .flatMap(a =>
            a.aprobaciones.cohortes.filter(
              c =>
                c.cohorte === cohorte &&
                (planesFiltrados.length === 0 || planesFiltrados.includes(c.codigoPlan))
            )
          )
          .map(c => c.aprobacionAnual)
    
        const aprobacionPromedio =
          aprobaciones.length > 0
            ? aprobaciones.reduce((sum, aprobacion) => sum + aprobacion, 0) / aprobaciones.length
            : 0;
    
        if (aprobacionPromedio > 0) {
          asignaturasVisibles.add(asignatura)
        }
    
        return parseFloat(aprobacionPromedio.toFixed(1))
      })
    
      return {
        label: `Cohorte ${cohorte}`,
        backgroundColor: datosPorAsignatura.map(data =>
          data > this.corteAprobacion ? coloresPorCohorte[cohorte] : 'rgba(255, 99, 132, 0.3)'
        ),
        borderColor: datosPorAsignatura.map(data =>
          data > this.corteAprobacion ? 'black' : 'rgba(255, 99, 132, 1)'
        ),
        borderWidth: datosPorAsignatura.map(data => (data > this.corteAprobacion ? 0 : 2)),
        data: datosPorAsignatura
      }
    })
    
    // Filtrar labels que realmente están visibles
    this.labelsFiltrados = separarAsignaturas.filter(asignatura => asignaturasVisibles.has(asignatura))
    
    this.datosGraficoDeBarras = { labels: this.labelsFiltrados, datasets }
  }

  //funcion para obtener los datos para el grafico de lineas
  public obtenerDatosGraficoDeLineas(){
    //guarda los datos para el grafico de linea llamando a la funcion filtrarDatosGraficosDeLineas para obtener los datos
    this.datosGraficoDeLineas = {
      labels: Array.from(new Set(this.asignaturasCortePractico.flatMap(asignatura=>asignatura.asignaturas).map(a => a.nombreAsignatura))),
      datasets: this.filtrarDatosGraficoDeLineas()
    }
    //ordenamos los cohortes por numero en el titulo
    this.datosGraficoDeLineas.datasets.sort((a: { label: string }, b: { label: string }) => {
      const cohorteA = parseInt(a.label.match(/\d+/)?.[0] || '0')
      const cohorteB = parseInt(b.label.match(/\d+/)?.[0] || '0')
      return cohorteA - cohorteB
    })
    //ordenamos los cohortes seleccionados en el selector multiple
    this.cohortesSeleccionadoGraficoLineas.sort((a,b)=>a.value - b.value)
  }

  //esta funcion filtra los datos para el grafico de lineas
  public filtrarDatosGraficoDeLineas() {
    const planesFiltrados = this.planesSeleccionados.map(plan => plan.value)
    //gaurdamos los cohortes seleccionados
    const cohortesFiltrados = this.cohortesSeleccionadoGraficoLineas.map(c => c.value)
    //guardamos los id de las asignaturas de forma unica
    const separarAsignaturas = Array.from(new Set(this.asignaturasCortePractico.flatMap(asignatura => asignatura.asignaturas).map(a => a.idAsignatura)))
    //filtramos las asignaturas por los cohortes seleccionados, calculamos el promedio y le damos el formato para el grafico de lineas
    return cohortesFiltrados.map(cohorte => {
      const dataPorCohorte = separarAsignaturas.map(asignaturaId => {
        // Filtramos ReporteAsignaturaDTO para la asignatura y cohorte específico
        const promediosFiltrados = this.asignaturasCortePractico.filter(a =>
              a.asignaturas.idAsignatura === asignaturaId &&
              a.promedios.cohortes.some(coh =>coh.cohorte === cohorte && (planesFiltrados.length === 0 || planesFiltrados.includes(coh.codigoPlan)))
          ).flatMap(a => a.promedios.cohortes.filter(coh => coh.cohorte === cohorte && (planesFiltrados.length === 0 || planesFiltrados.includes(coh.codigoPlan))))
  
        const promedio = promediosFiltrados.length > 0 ? promediosFiltrados.reduce((sum, coh) => sum + coh.promedioAnual, 0) / promediosFiltrados.length: null
  
        return promedio !== null ? parseFloat(promedio.toFixed(1)) : null
      })
      //devolvemos con forma para el grafico de lineas
      return {
        label: 'Cohorte ' + cohorte,
        data: dataPorCohorte,
        backgroundColor: 'rgba(66, 165, 245, 0.1)',
        fill: false,
        borderColor: this.colorRandom(),
        tension: 0.4,
        borderWidth: 6,
        pointRadius: 8
      }
    })
  }
}