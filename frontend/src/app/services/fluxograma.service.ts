import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Fluxograma } from '../models/Fluxograma.model';
import { HttpClient } from '@angular/common/http';
import { AsignaturaFluxograma } from '../models/asignatura.dto';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root',
})
export class FluxogramaService {
  private apiUrl = environment.apiUrl + 'planes-de-estudio';

  constructor(private http: HttpClient) {}

  //Esta funcion obtiene todos los fluxogramas guardados en la base de datos con el formato "Fluxograma"
  /*
  Fluxograma tiene:
  -idPlan: id para identificar al plan
  -codigo: codigo con el cual se guarda el plan
  -titulo: titulo del plan
  -agnio: año del plan
  -fechaInstauracion: fecha exacta de creacion del plan
  */
  public obtenerFluxogramas(): Observable<Fluxograma[]> {
    return this.http.get<Fluxograma[]>(this.apiUrl);
  }

  //Esta funcion obtiene un fluxograma buscado por una id guardado en la base de datos con el formato "Fluxograma"
  /*
  Fluxograma tiene:
  -idPlan: id para identificar al plan
  -codigo: codigo con el cual se guarda el plan
  -titulo: titulo del plan
  -agnio: año del plan
  -fechaInstauracion: fecha exacta de creacion del plan
  */
  public obtenerFluxogramaPorID(id: number): Observable<Fluxograma> {
    return this.http.get<Fluxograma>(`${this.apiUrl}/${id}`);
  }

  //Esta funcion obtiene los detalles de un fluxograma (las asignaturas que componen el fluxograma) guardados en la base de datos con el formato "AsignaturaFluxograma"
  /*
  AsignaturaFluxograma tiene:
  -idAsignatura: id para identificar a la asignatura
  -codigo: codigo para identificar a la asignatura
  -nombre: nombre de la asignatura
  -nombreCorto: nombre corto de la asignatura
  -unidad: unidad a la que corresponde la asignatura
  -caracter: caracter de la asignatura
  -areaFormacion: area de formacion de la asignatura
  -creditos: creditos que otorga la asignatura
  -tributaciones: arreglo de numeros (idAsignatura) en los cuales tributa esta asignatura
  -prerrequisitos: arreglo de numeros (idAsignatura) de los cuales son prerrequisito esta asignatura
  -posicion: posicion de esta asignatura
  -semestre: semestre en el que se imparte la asignatura
  -competencias: arreglo de string donde se guardan las competencias de la asignatura
  -descripcion: descripcion de la asignatura
  -linkSyllabus: link al syllabus de la asignatura
  -idPlan: id del plan al que pertenece la asignatura
  -idLinea: id de la linea a la que pertenece la asignatura
  */
  public obtenerDetalleFluxograma(idFluxograma: number): Observable<AsignaturaFluxograma[]> {
    return this.http.get<AsignaturaFluxograma[]>(this.apiUrl + '/' + idFluxograma + '/fluxograma')
  }
}
