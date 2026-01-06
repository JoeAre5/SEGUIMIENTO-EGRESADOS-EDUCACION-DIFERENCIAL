import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AsignaturaDetalleDTO, ReporteAsignaturaDTO } from '../models/asignatura.dto';
import { Linea, LineaPlan, Lineas, LineasAsignaturas, LineaCambios } from '../models/lineaAsignatura.dto';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class AsignaturaService {

  private apiAsignaturas=  environment.apiUrl + 'asignaturas'
  private apiLinea= environment.apiUrl + 'lineas-asignaturas'

  constructor(private http: HttpClient) { }

  //Esta funcion obtiene todas las asignaturas guardadas en la base de datos con el formato "AsignaturaDetalleDTO"
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
  public obtenerAsignaturas(): Observable<AsignaturaDetalleDTO[]>{
    return this.http.get<AsignaturaDetalleDTO[]>(this.apiAsignaturas)
  }

  //Esta funcion obtiene el detalle de una asignatura guardado en la base de datos con el formato "ReporteAsignaturaDTO"
  /*
  ReporteAsignaturaDTO tiene:
  -asignaturas: asignaturas tiene el detalle de la asignatura con el formato "AsignaturaDetalleDTO"
  -promedios: promedios tiene el detalle de los promedios de la asignatura con el formato "PromediosDTO"
  -aprobaciones: aprobaciones tiene el detalle de las aprobaciones de la asignatura con el formato "AprobacionesDTO"

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

    PromediosDTO tiene:
    -general: general guarda los promedios de forma general independiente del cohorte y el plan, y el año del promedio con el formato "PromedioGeneralDTO"
    -cohortes: cohortes guarda los promedios teniendo en cuenta los cohortes y el plan del promedio con el formato "PromedioCohorteDTO"
    -promediosPorPlan: promediosPorPlan guarda los promedios teniendo en cuenta el plan pero no los cohortes con el formato "PromedioPorPlanDTO"

      PromedioGeneralDTO tiene:
      -agnio: año del promedio
      -promedio: promedio obtenido

      PromedioCohorteDTO tiene:
      -agnio: año del promedio
      -cohorte: cohorte que obtuvo el promedio
      -plan: plan en el cual se obtuvo el promedio
      -promedio: promedio obtenido

      PromedioPorPlanDTO tiene:
      -codigoPlan: codigo del plan 
      -agnio: año en el que se obtuvo el promedio
      -promedio: promedio obtenido
    
    AprobacionesDTO tiene:
    -general: general guarda las aprobaciones de forma general independiente del cohorte y el plan, y el año de la aprobacion con el formato "AprobacionGeneralDTO"
    -cohortes: cohortes guarda las aprobaciones teniendo en cuenta los cohortes y el plan de la aprobacion con el formato "AprobacionCohorteDTO"
    -aprobacionesPorPlan: aprobacionesPorPlan guarda las aprobaciones teniendo en cuenta el plan pero no los cohortes con el formato "AprobacionPorPlanDTO"

      AprobacionGeneralDTO tiene:
      -agnio: año de la aprobacion
      -aprobacion: aprobacion obtenida

      AprobacionCohorteDTO tiene:
      -agnio: año de la aprobacion
      -cohorte: cohorte que obtuvo la aprobacion
      -plan: plan en el cual se obtuvo la aprobacion
      -aprobacion: aprobacion obtenida

      AprobacionPorPlanDTO tiene:
      -codigoPlan: codigo del plan 
      -agnio: año en el que se obtuvo la aprobacion
      -aprobacion: aprobacion obtenida
  */
  public obtenerDetalleAsignatura(codigoAsignatura: string): Observable<ReporteAsignaturaDTO>{
    return this.http.get<ReporteAsignaturaDTO>(this.apiAsignaturas + '/' + codigoAsignatura + '/detalle')
  }

  //Esta funcion obtiene los detalles de las asignaturas de corte practico guardado en la base de datos con el formato "ReporteAsignaturaDTO"
  /*
  ReporteAsignaturaDTO tiene:
  -asignaturas: asignaturas tiene el detalle de la asignatura con el formato "AsignaturaDetalleDTO"
  -promedios: promedios tiene el detalle de los promedios de la asignatura con el formato "PromediosDTO"
  -aprobaciones: aprobaciones tiene el detalle de las aprobaciones de la asignatura con el formato "AprobacionesDTO"

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

    PromediosDTO tiene:
    -general: general guarda los promedios de forma general independiente del cohorte y el plan, y el año del promedio con el formato "PromedioGeneralDTO"
    -cohortes: cohortes guarda los promedios teniendo en cuenta los cohortes y el plan del promedio con el formato "PromedioCohorteDTO"
    -promediosPorPlan: promediosPorPlan guarda los promedios teniendo en cuenta el plan pero no los cohortes con el formato "PromedioPorPlanDTO"

      PromedioGeneralDTO tiene:
      -agnio: año del promedio
      -promedio: promedio obtenido

      PromedioCohorteDTO tiene:
      -agnio: año del promedio
      -cohorte: cohorte que obtuvo el promedio
      -plan: plan en el cual se obtuvo el promedio
      -promedio: promedio obtenido

      PromedioPorPlanDTO tiene:
      -codigoPlan: codigo del plan 
      -agnio: año en el que se obtuvo el promedio
      -promedio: promedio obtenido
    
    AprobacionesDTO tiene:
    -general: general guarda las aprobaciones de forma general independiente del cohorte y el plan, y el año de la aprobacion con el formato "AprobacionGeneralDTO"
    -cohortes: cohortes guarda las aprobaciones teniendo en cuenta los cohortes y el plan de la aprobacion con el formato "AprobacionCohorteDTO"
    -aprobacionesPorPlan: aprobacionesPorPlan guarda las aprobaciones teniendo en cuenta el plan pero no los cohortes con el formato "AprobacionPorPlanDTO"

      AprobacionGeneralDTO tiene:
      -agnio: año de la aprobacion
      -aprobacion: aprobacion obtenida

      AprobacionCohorteDTO tiene:
      -agnio: año de la aprobacion
      -cohorte: cohorte que obtuvo la aprobacion
      -plan: plan en el cual se obtuvo la aprobacion
      -aprobacion: aprobacion obtenida

      AprobacionPorPlanDTO tiene:
      -codigoPlan: codigo del plan 
      -agnio: año en el que se obtuvo la aprobacion
      -aprobacion: aprobacion obtenida
  */
  public obtenerDetalleAsignaturas(): Observable<ReporteAsignaturaDTO[]>{
    return this.http.get<ReporteAsignaturaDTO[]>(this.apiAsignaturas + '/corte-practico/tendencias')
  }

  public agregarAsignaturaLinea(idPlan: number, asignatura:Linea[]){
    return this.http.post<Linea>(`${this.apiLinea}/planes/${idPlan}/asignaturas`, asignatura);
  }

  public guardarCambios(idPlan:number, lineas: LineaCambios){
    return this.http.post<Linea>(`${this.apiLinea}/planes/${idPlan}/asignaturas`, lineas);
  }

  public obtenerListadoAsignaturas(idPlan:Number) {
    return this.http.get<LineasAsignaturas>(`${this.apiLinea}/planes/${idPlan}/asignaturas`);
  }

  public obtenerLineas(): Observable<Lineas[]> {
    return this.http.get<Lineas[]>(`${this.apiLinea}`);
  }

  public eliminarLinea(idPlan: number, idLinea: number){
    return this.http.delete(`${this.apiLinea}/planes/${idPlan}/lineas/${idLinea}`)
  }

  public obtenerLineasPlan(idPlan: number) {
    return this.http.get<LineaPlan>(`${this.apiLinea}/planes/${idPlan}`);
  } 
}
