import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { MultiSelectModule } from 'primeng/multiselect';
import { AsignaturaService } from '../../services/asignatura.service';
import { ReporteAsignaturaDTO } from '../../models/asignatura.dto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalle-asignatura',
  standalone: true,
  imports: [ChartModule, MultiSelectModule, FormsModule, CommonModule],
  templateUrl: './detalle-asignatura.component.html',
  styleUrls: ['./detalle-asignatura.component.css']
})
export class DetalleAsignaturaComponent implements OnInit {

  constructor(
    private router: Router,
    private asignaturaService: AsignaturaService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    //obtenemos el codigo de la asignatura de la ruta
    this.codigoAsignatura = this.route.snapshot.paramMap.get('codigoAsignatura')!
    //llamamos al servicio que nos va a dar los detalles de la asignatura
    this.asignaturaService.obtenerDetalleAsignatura(this.codigoAsignatura).subscribe(respuesta=>{
      //guardamos el detalle da la asignatura
      this.detalleAsignatura=respuesta
      //guardamos los años de forma unica para el filtrador
      this.anios = Array.from(this.detalleAsignatura.promedios.general.map(promedio=>promedio.agnio)).sort()
      //guardamos los cohortes de forma unica para el grafico de barras con el formato del selector multiple ({label: string, value;: number})
      this.cohortesGraficoBarras = Array.from(new Set(this.detalleAsignatura.promedios.cohortes.map(a => a.cohorte))).sort().map(cohorte => ({ label: cohorte.toString(), value: cohorte }))
      //dejamos todos los cohortes seleccionados automaticamente
      this.cohortesSeleccionadosGraficoBarras = [...this.cohortesGraficoBarras]
      //llamamos a la funcion para cargar las estadisticas
      this.cargarEstadisticas()
    })
  }

  //variable para guardar el detalle de la asignatura
  public detalleAsignatura: ReporteAsignaturaDTO= {
    asignaturas: {
      idAsignatura: 0,
      codigoAsignatura: '',
      nombreAsignatura: '',
      nombreCortoAsignatura: '',
      semestreRealizacion: 0,
      areaFormacion: '',
      planes: []
    },
    promedios: {
      general: [],
      cohortes: [],
      promediosPorPlan: []
    },
    aprobaciones: {
      general: [],
      cohortes: [],
      aprobacionesPorPlan: []
    }
  
  }
  //variable para guardar los datos del grafico
  public datosGrafico: any
  //variable para guardar todos los años para el filtro de estadisticas anuales
  public anios: number[]=[]
  //variable para guardar el año seleccionado en el filtro de estadisticas anuales
  public anioSeleccionado: number | '' = ''
  //variable para guardar el codigo de la asignatura  
  public codigoAsignatura: string= ''
  //variable para guardar el promedio general obtenido
  public promedioGeneral: number=0
  //variable para guardar los promedios por plan
  public promediosPorPlan: {codigoPlan: number; promedio: number}[]=[]
  //variable para guardar la aprobacion general
  public aprobacionGeneral: number=0
  //variable para guardar las aprobaciones por plan
  public aprobacionesPorPlan: {codigoPlan: number; aprobacion: number}[]=[]
  //variable para guardar los cohorte para el filtrador del grafico
  public cohortesGraficoBarras: {label: string; value: number}[] = []
  //variable para guardar los multiples cohortes seleccionados en el filtrador del grafico
  public cohortesSeleccionadosGraficoBarras: {label: string; value: number}[] = []
  //variable para inicializar el tiempo de carga
  public cargando: boolean= true
  //variable para guardar las opciones del grafico
  public opcionesGrafico: any = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          font: {
            size: 24,
          },
        },
      },
      datalabels: {
        display: true,
        color: 'white',
        align: 'center',
        font: {
          weight: 'bold',
          size: 16,
        },
        backgroundColor: 'black',
        borderRadius: 4,
        padding: 6,
        borderColor: 'white',
        borderWidth: 2,
      },
    },
    scales: {
      x: {
        grid: {
          color: '#e0e0e0',
        },
        ticks: {
          font: {
            size: 16,
          },
        },
        title: {
          display: true,
          text: 'Cohortes',
          font: {
            size: 24,
          },
        },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 10,
          callback: function (value: number) {
            return value.toFixed(0);
          },
          font: {
            size: 16,
          },
          grid: {
            color: '#e0e0e0',
          },
        },
        title: {
          display: true,
          text: 'Porcentaje Aprobación',
          font: {
            size: 24,
          },
        },
      },
    },
    backgroundColor: '#ffffff',
  }

  //esta funcion hace los calculos y guarda las estadisticas para ser mostradas
  public cargarEstadisticas() {
    //se inicializa el tiempo de carga
    this.cargando = true
    setTimeout(() => {
      this.cargando = false
    }, 1000)
    //llamamos a la funcion para filtar los datos anuales y el grafico de barra
    this.filtrarDatosAnuales()
    this.filtrarGraficoBarra()
  }

  //esta funcion filtra los datos anuales haciendo calculos para mostrar promedios y aprobacion general y por plan, tambien tiene un filtrador por año
  public filtrarDatosAnuales(){
    //comprobamos si se escogio un año
    if (this.anioSeleccionado) {
      //si se escogio un año hacemos un filtro guardando los promedios generales que correspondan al año seleccionado
      const promedioAnio = this.detalleAsignatura.promedios.general.filter((promedio) => promedio.agnio === Number(this.anioSeleccionado))
      //comprobamos si existe un promedio general correspondiente al año
      if (promedioAnio.length > 0) {
        //si existe guardamos el promedio general
        this.promedioGeneral = parseFloat(promedioAnio[0].promedio.toFixed(2))
      }
      //hacemos un filtro guardando las aprobaciones generales que correspondan al año seleccionado
      const aprobacionAnio = this.detalleAsignatura.aprobaciones.general.filter((aprobacion) => aprobacion.agnio === Number(this.anioSeleccionado))
      //comprobamos si existe una aprobacion general correspondiente al año
      if (aprobacionAnio.length > 0) {
        //si existe guardamos la aprobacion general
        this.aprobacionGeneral = parseFloat(aprobacionAnio[0].aprobacion.toFixed(2))
      }
      //guardamos los promedios por plan a los promediosPorPlan que esten en el año seleccionado
      this.promediosPorPlan = this.detalleAsignatura.promedios.promediosPorPlan.filter((plan) => plan.agnioRendicion === Number(this.anioSeleccionado)).map((plan) => ({
        //guardamos el codigo del plan
          codigoPlan: plan.codigoPlan,
          //guardamos el promedio del plan tomando todos los promedios que esten en el plan y dividiendo por la cantidad de promedios que haya en el plan
          promedio: parseFloat(
            (
              this.detalleAsignatura.promedios.promediosPorPlan.filter((p) => p.codigoPlan === plan.codigoPlan && p.agnioRendicion === Number(this.anioSeleccionado)).reduce((acc, p) => acc + p.promedioHistorico, 0) /
              this.detalleAsignatura.promedios.promediosPorPlan.filter((p) => p.codigoPlan === plan.codigoPlan && p.agnioRendicion === Number(this.anioSeleccionado)).length
            ).toFixed(2)
          ),
        }))
      //guardamos las aprobaciones por plan a las aprobacionesPorPlan que esten en el año seleccionado
      this.aprobacionesPorPlan = this.detalleAsignatura.aprobaciones.aprobacionesPorPlan.filter((plan) => plan.agnioRendicion === Number(this.anioSeleccionado)).map((plan) => ({
          //guardamos el codigo del plan
          codigoPlan: plan.codigoPlan,
          //guardamos la aprobacion del plan tomando todos las aprobaciones que esten en el plan y dividiendo por la cantidad de aprobaciones que haya en el plan
          aprobacion: parseFloat(
            (
              this.detalleAsignatura.aprobaciones.aprobacionesPorPlan.filter((a) => a.codigoPlan === plan.codigoPlan && a.agnioRendicion === Number(this.anioSeleccionado)).reduce((acc, a) => acc + a.aprobacionHistorica, 0) /
              this.detalleAsignatura.aprobaciones.aprobacionesPorPlan.filter((a) => a.codigoPlan === plan.codigoPlan && a.agnioRendicion === Number(this.anioSeleccionado)).length
            ).toFixed(2)
          ),
        }))
    } else {
      //si no se escogio un año sumamos todos los promedios generales que existen y los dividimos por la cantidad de promedios generales
      this.promedioGeneral = parseFloat(
        (
          this.detalleAsignatura.promedios.general.map((promedio) => promedio.promedio).reduce((acc, promedio) => acc + promedio, 0) /
          this.detalleAsignatura.promedios.general.length
        ).toFixed(2)
      )
      //sumamos todas las aprobaciones generales que existen y las dividimos por la cantidad de aprobaciones generales
      this.aprobacionGeneral = parseFloat(
        (
          this.detalleAsignatura.aprobaciones.general.map((aprobacion) => aprobacion.aprobacion).reduce((acc, aprobacion) => acc + aprobacion, 0) /
          this.detalleAsignatura.aprobaciones.general.length
        ).toFixed(2)
      )
      //creamos un arreglo de planes unicos
      const codigosPlanesUnicos = Array.from(
        new Set(this.detalleAsignatura.promedios.promediosPorPlan.map(plan => plan.codigoPlan))
      )
      //guardamos los promedios por plan 
      this.promediosPorPlan = codigosPlanesUnicos.map(codigoPlan => ({
        codigoPlan,
        //calculamos el promedio sumando los promedios y dividiendolos en la cantidad de promedios que hay por plan
        promedio: parseFloat(
          (
            this.detalleAsignatura.promedios.promediosPorPlan.filter(plan => plan.codigoPlan === codigoPlan).reduce((acc, plan) => acc + plan.promedioHistorico, 0) /
            this.detalleAsignatura.promedios.promediosPorPlan.filter(plan => plan.codigoPlan === codigoPlan).length
          ).toFixed(2)
        )
      }))
      //guardamos las aprobaciones por plan
      this.aprobacionesPorPlan = codigosPlanesUnicos.map(codigoPlan => ({
        codigoPlan,
        //calculamos la aprobacion sumando las aprobaciones y dividiendolas en la cantidad de aprobaciones que hay por plan
        aprobacion: parseFloat(
          (
            this.detalleAsignatura.aprobaciones.aprobacionesPorPlan.filter(plan => plan.codigoPlan === codigoPlan).reduce((acc, plan) => acc + plan.aprobacionHistorica, 0) /
            this.detalleAsignatura.aprobaciones.aprobacionesPorPlan.filter(plan => plan.codigoPlan === codigoPlan).length
          ).toFixed(2)
        )
      }))
    }
  }

  //esta funcion filtra los datos para el grafico de barra por el filtro de multiples cohortes
  public filtrarGraficoBarra() {
    //guardamos los cohortes seleccionados en el filtro
    const cohortesFiltrados = this.cohortesSeleccionadosGraficoBarras.map(c => c.value)
    //guardamos los tipos de ingreso de forma unica
    const tipoIngresos = Array.from(new Set(this.detalleAsignatura.promedios.cohortes.map(c => c.tituloPlan)))
    //guardamos los cohortes como labels para mostrarlos en el grafico
    const labels = cohortesFiltrados.map((cohorte) => this.detalleAsignatura.aprobaciones.cohortes.find((a) => a.cohorte === cohorte)?.cohorte.toString() || '')
    //guardamos los dataset para cada cohorte
    const datasets = [
      {
        label: 'General',
        backgroundColor: this.colorRandom(),
        //mapeamos los cohortes que tenemos filtrados para mostrarlos unicamente estos en el grafico, luego entre todos los cohortes comprobamos los que correspondan
        //al cohorte sobre el que estamos parados, sumamos todos y lo dividimos por la cantidad de aprobaciones que esten en este cohorte, esto se hace para sumar y
        //hacer un promedio (de aprobaciones) de todos los años que han dando la asignatura en este cohorte
        data: cohortesFiltrados.map(cohorte => {
          const datosCohorte = this.detalleAsignatura.aprobaciones.cohortes.filter(c => c.cohorte === cohorte)
          return parseFloat((datosCohorte.reduce((acc, c) => acc + c.aprobacionAnual, 0) / datosCohorte.length || 0).toFixed(2))
        }),
      },
    ]
    //guardamos la informacion en el plan que corresponda
    tipoIngresos.forEach((plan, index) => {
      datasets.push({
        label: plan,
        backgroundColor: this.colorRandom(),
        data: cohortesFiltrados.map(cohorte => {
          const datosCohorte = this.detalleAsignatura.aprobaciones.cohortes.filter(c => c.cohorte === cohorte && c.tituloPlan === plan)
          return parseFloat((datosCohorte.reduce((acc, c) => acc + c.aprobacionAnual, 0) / datosCohorte.length || 0).toFixed(2))
        }),
      })
    })
    //ordenamos la informacion para que este de menor a mayor
    datasets.map(a=>a.data.sort())
    labels.sort()
    this.cohortesSeleccionadosGraficoBarras.sort((a, b) => a.value - b.value)
    //guardamos la informacion en los datos para el grafico
    this.datosGrafico = {labels, datasets}
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

  //esta funcion devuelve a la lista de asignaturas
  public devolverAListaAsignaturas() {
    this.router.navigateByUrl('/asignaturas')
  }
}
