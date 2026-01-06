import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResultadosEnd } from '../models/resultadosEND.dto';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class EndService {

  constructor(private http: HttpClient) { }

  private apiUrl= environment.apiUrl + 'ends';

  public nuevoEND(files: FormData){
    return this.http.post<any>(this.apiUrl, files)
  }

  public obtenerEND(){
    return this.http.get<ResultadosEnd[]>(this.apiUrl + "/documentos")
  }

  public obtenerENDID(idDato:number){
    return this.http.get<ResultadosEnd>(this.apiUrl + "/documentos/" + idDato)
  }

  public editarEND(files: FormData){
    return this.http.patch<any>(this.apiUrl, files)
  }
  
}
