import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-menu-estudiante',
  standalone: true,
  imports: [],
  templateUrl: './menu-estudiante.component.html',
  styleUrl: './menu-estudiante.component.css',
})
export class MenuEstudianteComponent {
  // nombre del estudiante seleccionado  en la vista anterior (listarEstudiantes)
  nombreEstudiante: string = '';
  // rut del estudiante seleccionado en la vista anterior
  rutEstudiante: string = '';
  // datos pasados por la ruta anterior
  routeData: any;
  // id del estudiante para hacer llamadas
  idEstudiante: number = 0;

  // solo se inyecta el servicio router para redirigir a los vistas posibles
  constructor(private router: Router, private route: ActivatedRoute) {
    // se obtiene los parametros de la ruta
    this.obtenerParametrosDeLaRuta();
  }

  /**
   * Funcion que redirige al usuario a la vista de practicas del estudiante,
   * se envia a traves del estado de la ruta el rut del estudiante
   */
  public irAPracticasEstudiante() {
    this.router.navigate(['practicas-estudiante', this.idEstudiante]);
  }
  /**
   * Funcion que redirige al usuario a la vista de avance curricular del estudiante,
   * se envia a traves del estado de la ruta el rut del estudiante
   */
  public irAAvanceCurricular() {
    this.router.navigate(['avance-estudiante', this.idEstudiante]);
  }

  /**
   * Funcion para devolver a la vista anterior de listar estudiantes
   */
  public devolverAListarEstudiantes() {
    this.router.navigate(['/listar-estudiantes']);
  }

  /**
   * Funcion que obtiene los parametros de la ruta definidos en la ruta anterior
   * En este caso la vista anterior enviaria a la ruta [menuEstudiante/:idEstudiante/:nombreEstudiante]
   */
  public obtenerParametrosDeLaRuta() {
    this.route.params.subscribe((param) => {
      this.idEstudiante = param['idEstudiante'];
      this.nombreEstudiante = param['nombreEstudiante'];
    });
  }
}
