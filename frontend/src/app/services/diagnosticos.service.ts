import { Injectable } from '@angular/core';
import { PromedioDiagnostico } from '../models/diagnosticos.dto';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Asignatura } from '../models/asignaturas.dto';
import { AsignaturaSola } from '../models/asignaturaSola.dto';
import { AsignaturaDetalleDTO } from '../models/asignatura.dto';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root',
})
export class DiagnosticosService {
  constructor(private http: HttpClient) {}

  public apiUrl = environment.apiUrl + 'asignaturas'

  //Esta funcion obtiene todos los fluxogramas guardados en la base de datos con el formato "Fluxograma"
  /*
  Fluxograma tiene:
  -idPlan: id para identificar al plan
  -codigo: codigo con el cual se guarda el plan
  -titulo: titulo del plan
  -agnio: año del plan
  -fechaInstauracion: fecha exacta de creacion del plan
  */
  public obtenerPromedios(codigoAsignatura: string): Observable<PromedioDiagnostico[]> {
    return this.http.get<PromedioDiagnostico[]>(this.apiUrl + '/promedios/general/' + codigoAsignatura)
  }

  //Esta funcion obtiene el detalle de la asignatura guardados en la base de datos con el formato "AsignaturaDetalleDTO"
  /*
  AsignaturaDetalleDTO tiene:
  -idAsignatura: id para identificar la asignatura
  -codigoAsignatura: codigo para identificar la asignatura
  -nombreAsignatura: nombre de la asignatura
  -nombreCortoAsignatura: nombre corto de la asignatura
  -semestreRealizacion: semestre en el cual se esta realizando la asignatura
  -areaFormacion: area de formacion al que pertenece la asignatura
  -planes: arreglo de planes con el formato "PlanDetalleDTO"

    PlanDetalleDTO tiene:
    -titulo: titulo del plan
    -codigo: codigo para identificar el plan
    -fechaInstauracion: fecha en la cual se creo el plan
  */
  public obtenerNombreAsignatura(codigoAsignatura: string): Observable<AsignaturaDetalleDTO> {
    return this.http.get<AsignaturaDetalleDTO>(this.apiUrl + '/' + codigoAsignatura)
  }
}
