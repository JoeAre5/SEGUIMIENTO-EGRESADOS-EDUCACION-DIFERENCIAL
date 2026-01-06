import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ContextMenuModule } from 'primeng/contextmenu';
import { PracticasService } from '../../services/practicas.service';


@Component({
  selector: 'app-detalle-practica',
  standalone: true,
  imports: [ContextMenuModule, CommonModule],
  templateUrl: './detalle-practica.component.html',
  styleUrls: ['./detalle-practica.component.css']
})
export class DetallePracticaComponent implements OnInit {

  constructor(
    private router: Router,
    private practicasService: PracticasService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.menuItems = [
      {
        label: 'Ir a menú alumno',
        icon: 'pi pi-arrow-right',
        command: () => this.navegarMenuAlumno(this.alumno.id)
      },
      {
        label: 'Otra opción',
        icon: 'pi pi-info-circle',
        command: () => alert('Otra acción ejecutada')
      }
    ]
    this.obtenerAlumno()
    this.tituloPractica = this.route.snapshot.paramMap.get('titulo')!
  }

  public alumno: any
  public menuItems: MenuItem[] = []
  public tituloPractica!: string

  public obtenerAlumno() {
    this.practicasService.obtenerAlumno(this.tituloPractica).subscribe((data) => {
      this.alumno = data
      console.log('Alumno de prueba cargado:', this.alumno)
    })
  }

  public navegarMenuAlumno(id: number) {
    this.router.navigate(['/menu-alumno', id])
  }

}
