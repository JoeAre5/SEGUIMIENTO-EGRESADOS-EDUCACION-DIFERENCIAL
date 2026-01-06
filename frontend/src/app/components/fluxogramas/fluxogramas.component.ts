import { Component, OnInit } from '@angular/core';
import { Fluxograma } from '../../models/Fluxograma.model';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FluxogramaService } from '../../services/fluxograma.service';
import { MenubarModule } from 'primeng/menubar';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';


@Component({
  selector: 'app-fluxogramas',
  templateUrl: './fluxogramas.component.html',
  styleUrls: ['./fluxogramas.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, MenubarModule, CardModule, ProgressSpinnerModule]
})
export class FluxogramasComponent implements OnInit {

  constructor(
    private fluxogramaService: FluxogramaService,
    private router: Router
  ) {}

  ngOnInit() {
    //se llama a la funcion para cargar todos los fluxogramas
    this.cargarFluxogramas()
  }

  //variable para almacenar los fluxogramas
  public fluxogramas: Fluxograma[] = []
  //variable para iniciar el tiempo de carga
  public cargando = true
  //variable para el tiempo de carga
  public tiempoDeCarga: any

  //esta funcion llama al servicio de fluxogramas y crea el tiempo de carga
  public cargarFluxogramas(): void {
    //se llama a la funcion del servicio para obtener todos los fluxogramas
    this.fluxogramaService.obtenerFluxogramas().subscribe((fluxogramas) => {
      //guardamos todos los fluxogramas
      this.fluxogramas = fluxogramas
    })
    //creamos el tiempo de carga
    this.tiempoDeCarga = setTimeout(() => {this.cargando = false}, 1000)
  }

  //esta funcion redirige al detalle del fluxograma
  public escogerPlan(idPlan: number): void {
    this.router.navigate(['/fluxograma/', idPlan])
  }
  
  //esta funcion devuelve al menu
  public devolverAlMenu() {
    this.router.navigateByUrl('/menu')
  }
}
