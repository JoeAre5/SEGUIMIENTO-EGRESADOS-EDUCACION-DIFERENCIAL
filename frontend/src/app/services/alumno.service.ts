import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlumnoAvance } from '../models/alumno-avance';
import { Observable, of } from 'rxjs';
import { Estudiante, EstudiantePracticas } from '../models/estudiante';
import { DetallesPracticaDTO } from '../models/practica';
import { CohorteEstudiantes } from '../models/listar-estudiantes';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root',
})
export class AlumnoService {
  /**
   * Servicio que inyecta los datos correspondiente a los alumnos
   *
   * Es inyectado a las vistas:
   *  - avance-estudiante
   *  - practicas de un estudiante
   *  - listar estudiantes
   */

  // FIXME: crear una archivo .env para meter las urls
  private api_url_avance = environment.apiUrl + 'estudiantes/';
  private api_url_practicas = environment.apiUrl + 'practicas/estudiante/';
  private api_url_listar_estudiantes = environment.apiUrl + 'estudiantes/cohorte';

  constructor(private httpclient: HttpClient) {}

  /**
   * Funcion  que obtiene el avance que tiene el estudiante a lo largo de la carrera
   * @param {number} id_estudiante
   * 
   * @returns {Observable<AlumnoAvance>}
   *
   */
  public getAvanceEstudiante(id_estudiante: string): Observable<AlumnoAvance> {
    return this.httpclient.get<AlumnoAvance>(
      this.api_url_avance + id_estudiante + '/avance'
    );
  }

  /**
   * Funcion que obtiene los datos de las practicas realizadas por el estudiante
   * @param {number} id_estudiante
   *
   * @returns {EstudiantePracticas}
   */
  public getPracticasAlumno(
    id_estudiante: String
  ): Observable<DetallesPracticaDTO> {
    return this.httpclient.get<DetallesPracticaDTO>(
      this.api_url_practicas + id_estudiante
    );
  }
  /**
   * Funcion que obtiene todos los estudiante o puede obtener los estudiantes por cohorte,
   * el parametro cohorte puede ser opcional
   *
   * @returns { ListarEstudiantes }
   */
  public getEstudiantes(): Observable<CohorteEstudiantes[]> {
    return this.httpclient.get<CohorteEstudiantes[]>(
      this.api_url_listar_estudiantes
    );
  }
}
