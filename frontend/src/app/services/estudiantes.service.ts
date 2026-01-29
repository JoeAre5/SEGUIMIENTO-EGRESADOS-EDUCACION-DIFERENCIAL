import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EstudianteDTO {
  idEstudiante: number;
  nombreCompleto: string;
  rut: string;
  agnioIngreso?: number;
  idPlan?: number;
}


 // DTO para crear estudiante

export interface CreateEstudianteDTO {
  rut: string;
  nombre: string;
  apellido: string;

  nombreSocial?: string;
  agnioIngreso?: number;
  idPlan?: number;
}


export interface UpdateEstudianteDTO {
  rut?: string;
  nombre?: string;
  apellido?: string;

  nombreSocial?: string;
  agnioIngreso?: number;
  idPlan?: number;
}

@Injectable({
  providedIn: 'root',
})
export class EstudiantesService {
  private apiUrl = 'http://localhost:3000/estudiantes';

  constructor(private http: HttpClient) {}

  // NUEVO: actualizar plan de estudios del estudiante
  updatePlan(idEstudiante: number, idPlan: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${idEstudiante}/plan`, {
      idPlan: Number(idPlan),
    });
  }

  // traer todos (para dropdown egresados)
  findAll(): Observable<EstudianteDTO[]> {
    return this.http.get<EstudianteDTO[]>(this.apiUrl);
  }

  // crear nuevo estudiante
  create(dto: CreateEstudianteDTO): Observable<EstudianteDTO> {
    return this.http.post<EstudianteDTO>(this.apiUrl, dto);
  }

  // obtener 1 (si lo ocupas)
  findOne(idEstudiante: number): Observable<EstudianteDTO> {
    return this.http.get<EstudianteDTO>(`${this.apiUrl}/${idEstudiante}`);
  }

  // update (si lo ocupas)
  update(idEstudiante: number, dto: UpdateEstudianteDTO): Observable<EstudianteDTO> {
    return this.http.patch<EstudianteDTO>(`${this.apiUrl}/${idEstudiante}`, dto);
  }

  // delete (si lo ocupas)
  delete(idEstudiante: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idEstudiante}`);
  }
}
