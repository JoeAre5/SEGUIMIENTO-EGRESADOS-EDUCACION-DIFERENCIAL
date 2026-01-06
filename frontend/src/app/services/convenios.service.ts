import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActualizarConvenio, Convenio, Convenios, CreateConvenioDTO, DetalleConvenio} from '../models/convenios.dto';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ConveniosService {
  constructor(private http: HttpClient) { }

  private apiUrl= environment.apiUrl + 'convenios';

  public obtenerConvenios(): Observable<Convenios>{
    return this.http.get<Convenios>(this.apiUrl + "/")
  }

  public obtenerDetalleConvenios(idConvenio: number): Observable<DetalleConvenio>{
    return this.http.get<DetalleConvenio>(this.apiUrl + "/" + idConvenio)
  }

  public actualizarConvenio(idConvenio: number, datos: FormData): Observable<Convenio>{
    return this.http.patch<Convenio>(this.apiUrl + "/" + idConvenio, datos)
  }

  public eliminarConvenio(idConvenio: number): Observable<any>{
    return this.http.delete(this.apiUrl + "/" + idConvenio)
  }

  public nuevoConvenio(files: FormData){
    // console.log(convenioTest)
    console.log(files.getAll)
    return this.http.post<any>(this.apiUrl, files)
  }
}
