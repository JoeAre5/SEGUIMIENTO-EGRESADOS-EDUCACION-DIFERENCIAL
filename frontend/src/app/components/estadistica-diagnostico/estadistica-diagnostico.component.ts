import { Component, OnInit } from '@angular/core';
import { DiagnosticosService } from '../../services/diagnosticos.service';
import { PromedioDiagnostico } from '../../models/diagnosticos.dto';
import { ChartModule } from 'primeng/chart';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { AsignaturaDetalleDTO } from '../../models/asignatura.dto';

@Component({
  selector: 'app-estadistica-diagnostico',
  standalone: true,
  imports: [ChartModule, CommonModule, FormsModule, MultiSelectModule],
  templateUrl: './estadistica-diagnostico.component.html',
  styleUrl: './estadistica-diagnostico.component.css',
})
export class EstadisticaDiagnosticoComponent implements OnInit {

  ngOnInit(): void {
    //guardamos el codigo de la asignatura y el id de del fluxograma de la ruta
    this.codigoAsignatura = this.route.snapshot.paramMap.get('codigoAsignatura')!
    this.idFluxograma = +this.route.snapshot.paramMap.get('idFluxograma')!
    //llamamos al servicio para que nos entregue los promedios de la asignatura que le indicamos, de esto promedios usaremos unicamente los años
    //para inicializar el filtro
    this.diagnosticosService.obtenerPromedios(this.codigoAsignatura).subscribe(diagnosticos=>{
      //creamos un tiempo para cargar datos
      this.cargando = true
      setTimeout(() => {
        this.cargando = false
      }, 1000)
      //guardamos los años que se obtienen del servicio, estos son para poder hacer el filtro, estos los ponemos en un arreglo de año: {label: string, value: number}
      this.anios = Array.from(new Set(diagnosticos.map(diagnostico => diagnostico.agnio))).sort((a, b) => a - b).map(año => ({ label: año.toString(), value: año }))
      //aqui dejamos por defecto seleccionados todos los años
      this.aniosSeleccionados = [...this.anios]
      //llamamos a las funciones para obtener el nombre de la asignatura y para obtener los promedios
      this.obtenerNombreAsignatura()
      this.obtenerPromedios()
    })
    
  }

  constructor(
    private diagnosticosService: DiagnosticosService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  //esta variable guardara los detalles de la asignatura
  public asignatura: AsignaturaDetalleDTO={
    areaFormacion:'',
    codigoAsignatura: '',
    idAsignatura: 0,
    nombreAsignatura: '',
    nombreCortoAsignatura: '',
    planes: [],
    semestreRealizacion: 0
  }
  //esta variable guardara el codigo de la asignatura
  public codigoAsignatura: string= ''
  //esta variable guardara el id del fluxograma
  public idFluxograma: number = 0
  //esta variable guardara los label para el grafico
  public labels: string[] = []
  //esta variable guarda la informacion para el grafico
  public data: any
  //esta variable guardara los años para el filtro de seleccion multiple
  public anios: {label: string; value: number}[] = []
  //esta variable guardara los años seleccionados en el filtro de seleccion multiple
  public aniosSeleccionados: {label: string; value: number}[] = []
  //esta variable guarda el numero para determinar la zona critica del grafico
  public cortePromedios: number= 4
  //esta variable se usa para iniciar el tiempo de carga
  public cargando: boolean= true
  //esta variable guarda las opciones para el grafico
  public opciones = {
    responsive: true,
    scales: {
      x:{
        title: {
          display: true,
          text: 'Años',
          font: {
            size: 24
          }
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Notas',
          font: {
            size: 24
          }
        }
      },
    },
    pointStyle: 'circle',
    pointRadius: 10,
    pointHoverRadius: 15,

    plugins: {
      title: {
        display: true,
        text: 'Promedio General por Año',
        font: {
          size: 24
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
  }

  //esta funcion va a buscar la asignatura con el codigo para guardarla y despues mostrar su nombre en el titulo
  public obtenerNombreAsignatura() {
    this.diagnosticosService.obtenerNombreAsignatura(this.codigoAsignatura).subscribe((asignatura) => {
      this.asignatura = asignatura
    })
  }

  //esta funcion busca obtener los label para el grafico
  public obtenerLabel(datos: PromedioDiagnostico[]): string[] {
    //guardamos los años seleccionados
    const aniosFiltrados = this.aniosSeleccionados.map(c => c.value)
    //hacemos un filtro para guardar unicamente los label de los años que fueron seleccionados en el filtro
    const separarAnios = Array.from(new Set(datos.filter(d => aniosFiltrados.includes(d.agnio)).map(a => a.agnio)))
    //ordenamos los años
    separarAnios.sort((a,b)=> a-b)
    //pasamos los años a string y los devolvemos
    this.labels = separarAnios.map(anio => anio.toString())
    return this.labels
  }

  //esta funcion busca obtener los datos para el grafico
  public obtenerDataset(datos: PromedioDiagnostico[]): number[] {
    //guardamos los años seleccionados
    const aniosFiltrados = this.aniosSeleccionados.map(c => c.value)
    //hacemos un filto para guardar unicamente los datos de los años seleccionados en el filtro
    const datosFiltrados = datos.filter(d => aniosFiltrados.includes(d.agnio))
    //devolvemos los datos ordenandolos y en un arreglo de numeros
    return datosFiltrados.sort((a, b) => a.agnio - b.agnio).map(element => element.promedio)
  }

  // esta funcion sirve para crear colores de forma random, basicamente crea el codigo de color de forma random
  public crearColorRandom() {
    const letras = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
      color += letras[Math.floor(Math.random() * 16)]
    }
    return color
  }

  //esta funcion obtiene todos los datos necesarios para mostrar en el grafico
  public obtenerPromedios() {
    //se llama al servicio para obtener los diagnosticos
    this.diagnosticosService.obtenerPromedios(this.codigoAsignatura).subscribe((diagnosticos) => {
      //los mandamos a obtener los label de estos
      this.obtenerLabel(diagnosticos)
      //obtenemos la data para el grafico donde tiene su label junto a su dataset
      this.data = {
        labels: this.labels,
        datasets: [
          {
            label: 'Promedio',
            //aqui es donde obtenemos el arreglo de numeros para mostrar
            data: this.obtenerDataset(diagnosticos),
            borderColor: this.crearColorRandom(),
            borderWidth: 4,
          },
        ],
      }
    })
    //ordenamos los años seleccionados en el filtro
    this.aniosSeleccionados.sort((a,b)=>a.value - b.value)
  }

  //esta funcion nos devuelve al detalle del fluxograma
  public devolverAlFluxograma() {
    this.router.navigate(['/fluxograma', this.idFluxograma])
  }
}
