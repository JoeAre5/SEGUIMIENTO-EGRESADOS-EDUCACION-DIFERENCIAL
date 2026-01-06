import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ListarPracticasPorConvenioDTO, PracticaEnConvenioDTO } from '../../models/practica';
import { PracticasService } from '../../services/practicas.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

@Component({
  selector: 'app-practicas-convenio',
  standalone: true,
  imports: [CommonModule, PaginatorModule],
  templateUrl: './practicas-convenio.component.html',
  styleUrls: ['./practicas-convenio.component.css']
})
export class PracticasConvenioComponent implements OnInit {

  constructor(
    private practicasService: PracticasService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) { }

  ngOnInit() {
    this.idConvenio = +this.route.snapshot.paramMap.get('idConvenio')!
    this.cargarDatos()
  }

  public practicas: ListarPracticasPorConvenioDTO={tituloConvenio:'', practicas:[]}
  public practicasFiltradas: PracticaEnConvenioDTO[]=[]
  public practicasPaginadas: PracticaEnConvenioDTO[]=[]
  public idConvenio: number=0
  public first: number = 0
  public rows: number = 5
  public totalRecords: number= 0
  public cargando: boolean= true

  public onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0
    this.rows = event.rows ?? 10
    this.actualizarPracticasPaginadas()
  }

  public actualizarPracticasPaginadas() {
    const inicio = this.first
    const final = this.first + this.rows
    this.practicasPaginadas = this.practicasFiltradas.slice(inicio, final)
  }

  public cargarDatos(){
    this.practicasService.obtenerPracticasPorConvenio(this.idConvenio).subscribe(respuesta=>{
      this.practicas=respuesta
      this.cargando = true
      setTimeout(() => {
        this.cargando = false
      }, 1000)
      this.practicasFiltradas=respuesta.practicas
      this.totalRecords=this.practicasFiltradas.length
      this.actualizarPracticasPaginadas()
    })
  }

  public filtrarPracticas(evento: any) {
    const query = evento.target.value.toLowerCase()
    this.practicasFiltradas = this.practicas.practicas.filter(practicas =>
      practicas.nombreCompleto.toLowerCase().includes(query) || practicas.tituloPractica.toLowerCase().includes(query)
    )
    this.totalRecords=this.practicasFiltradas.length
    this.first=0
    this.actualizarPracticasPaginadas()
  }

  public verDetallePractica(tituloPractica: string): void {
    this.router.navigate(['/practica-detalle', tituloPractica]);
  }
  
  public verPracticasEstudiante(idEstudiante: number): void {
    this.router.navigate(['/practicas-estudiante', idEstudiante]);
  }

  public volver(){
    this.location.back();
  }
}
