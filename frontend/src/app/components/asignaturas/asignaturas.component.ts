import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AsignaturaService } from '../../services/asignatura.service';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { CommonModule } from '@angular/common';
import { AsignaturaDetalleDTO } from '../../models/asignatura.dto';

@Component({
  selector: 'app-asignaturas',
  templateUrl: './asignaturas.component.html',
  standalone:true,
  imports: [PaginatorModule, CommonModule],
  styleUrls: ['./asignaturas.component.css']
})
export class AsignaturasComponent implements OnInit {

  constructor(
    private router: Router,
    private asignaturaService: AsignaturaService
  ) { }

  ngOnInit() {
    //llamamos a la funcion para cargar todas las asignaturas
    this.obtenerAsignaturas()
  }

  //variable para guardar todas las asignaturas
  public asignaturas: AsignaturaDetalleDTO[]= []
  //variable para guardar las asignaturas que se les aplico el filtro de busqueda
  public asignaturasFiltradas: AsignaturaDetalleDTO[]=[]
  //variable para guardar las asignaturas que se les aplico el filtro del paginator para ser mostradas
  public asignaturasPaginadas: AsignaturaDetalleDTO[]=[]
  //variable para indicar el primer registro en la pagina
  public inicio: number = 0
  //variable para indicar las filas que habran por pagina
  public filas: number = 5
  //variable para guardar la cantidad de asignaturas que hay
  public numeroAsignaturas: number= 0
  //variable para inicializar el tiempo de carga
  public cargando: boolean=true

  //funcion para redirigir al detalle de la asignatura
  public verDetalles(codigoAsignatura: string): void {
    this.router.navigate(['/detalle-asignatura', codigoAsignatura])
  }

  //funcion para actualizar valores al cambiar de pagina
  public cambioDePagina(event: PaginatorState) {
    //se actualiza el primer registro que se va a mostrar, si no existe se pone 0 por defecto
    this.inicio = event.first ?? 0
    //actualiza las filas de registros que se van a mostrar, si no existe se pone 5 por defecto
    this.filas = event.rows ?? 5
    //se llama a la funcion para actualizar las asignaturas
    this.actualizarAsignaturasPaginadas()
  }

  //esta funcion actualiza las asignaturas que se van a mostrar por pagina
  public actualizarAsignaturasPaginadas() {
    //establecemos el inicio y el final de las asignaturas que vamos a mostrar
    const inicio = this.inicio
    const final = this.inicio + this.filas
    //guardamos las asignaturas que estan en el rango que queremos mostrar
    this.asignaturasPaginadas = this.asignaturasFiltradas.slice(inicio, final)
  }

  //esta funcion filtra las asignaturas
  public filtrarAsignaturas(evento: any) {
    //tomamos el valor obtenido en el filtro y le quitamos las mayusculas
    const query = evento.target.value.toLowerCase()
    //filtramos las asignaturas para las que cumplan el requisito de incluir el filtro en su nombre o su codigo
    this.asignaturasFiltradas = this.asignaturas.filter(asignatura => asignatura.nombreAsignatura.toLowerCase().includes(query) || asignatura.codigoAsignatura.toLowerCase().includes(query))
    //guardamos la cantidad de asignaturas que tenemos despues de aplicar el filtro
    this.numeroAsignaturas=this.asignaturasFiltradas.length
    //establecemos el inicio en 0
    this.inicio=0
    //llamamos a la funcion para paginar las asignaturas filtradas
    this.actualizarAsignaturasPaginadas()
  }

  //funcion para obtener todas las asignaturas
  public obtenerAsignaturas(){
    //llamamos al servicio para obtener las asignaturas
    this.asignaturaService.obtenerAsignaturas().subscribe(asignaturas=>{
      //guardamos las asignatura
      this.asignaturas=asignaturas
      //creamos un tiempo de carga
      this.cargando = true
      setTimeout(() => {
        this.cargando = false
      }, 1000)
      //guardamos como asignaturas filtradas todas las asignaturas ya que no se ha aplicado ningun filtro
      this.asignaturasFiltradas=asignaturas
      //obtenemos el numero de asignaturas filtradas
      this.numeroAsignaturas=this.asignaturasFiltradas.length
      //llamamos a la funcion para paginar las asignaturas filtradas
      this.actualizarAsignaturasPaginadas()
    })
  }

  //funcion para volver al menu
  public volverAlMenu(){
    this.router.navigateByUrl('menu')
  }
}
