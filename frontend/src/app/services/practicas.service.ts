import { Injectable } from '@angular/core';
import { InfoPracticaDTO, ListarPracticasPorConvenioDTO } from '../models/practica';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root',
})
export class PracticasService {
  practicas: InfoPracticaDTO[] = [];
  constructor(private http: HttpClient) {}

  private apiUrl = environment.apiUrl + 'practicas'

  public obtenerPracticas(): InfoPracticaDTO[] {
    return this.practicas;
  }
  
  public obtenerAlumno(tituloPractica: string): Observable<any> {
    const alumnoPrueba = {id: 1, nombreCompleto: 'Gilberto Manuel Natanael Arias Ossandón', cohorte: '2021', promedio: 6.7, imagen: 'path/to/default-avatar.png'}
    return of(alumnoPrueba)
  }

  public obtenerPracticasPorConvenio(idConvenio: number): Observable<ListarPracticasPorConvenioDTO>{
    return this.http.get<ListarPracticasPorConvenioDTO>(this.apiUrl + '/convenio/' + idConvenio)
  }
}
