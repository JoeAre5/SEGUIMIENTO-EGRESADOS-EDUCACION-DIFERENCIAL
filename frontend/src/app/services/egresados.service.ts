import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/* ===========================
 ✅ DTOs de envío
=========================== */

export interface CreateEgresadoDto {
  idEstudiante: number;
  fechaEgreso: string; // ⚠️ debe llegar ISO DateTime
  situacionActual: string;

  empresa?: string;
  cargo?: string;
  sueldo?: number;
  anioIngresoLaboral?: number;
  anioSeguimiento?: number;

  telefono?: string;
  emailContacto?: string;
  direccion?: string;
  linkedin?: string;
  contactoAlternativo?: string;
}

export interface UpdateEgresadoDto extends Partial<CreateEgresadoDto> {}

/* ===========================
 ✅ Tipado de respuesta
=========================== */

export interface DocumentoEgresado {
  idDocumento?: number;
  nombre: string;
  url: string;
  idEgresado: number;
}

export interface EstudianteInfo {
  rut: string;
  nombreCompleto: string;
}

export interface EgresadoResponse {
  idEgresado: number;
  idEstudiante: number;
  fechaEgreso: string;
  situacionActual: string;

  empresa?: string;
  cargo?: string;
  sueldo?: number;
  anioIngresoLaboral?: number;
  anioSeguimiento?: number;

  telefono?: string;
  emailContacto?: string;
  direccion?: string;
  linkedin?: string;
  contactoAlternativo?: string;

  documentos?: DocumentoEgresado[];
  Estudiante?: EstudianteInfo;
}

/* ===========================
 ✅ SERVICE
=========================== */

@Injectable({
  providedIn: 'root',
})
export class EgresadosService {
  private apiUrl = 'http://localhost:3000/egresados';

  constructor(private http: HttpClient) {}

  // ✅ Crear con archivos (FormData)
  createWithFiles(formData: FormData): Observable<EgresadoResponse> {
    return this.http.post<EgresadoResponse>(this.apiUrl, formData);
  }

  // ✅ Traer todos
  findAll(): Observable<EgresadoResponse[]> {
    return this.http.get<EgresadoResponse[]>(this.apiUrl);
  }

  // ✅ Obtener por estudiante
  findByEstudiante(idEstudiante: number): Observable<EgresadoResponse> {
    return this.http.get<EgresadoResponse>(
      `${this.apiUrl}/estudiante/${idEstudiante}`
    );
  }

  // ✅ PATCH por estudiante (Swagger)
  updateByEstudiante(
    idEstudiante: number,
    dto: UpdateEgresadoDto
  ): Observable<EgresadoResponse> {
    return this.http.patch<EgresadoResponse>(
      `${this.apiUrl}/estudiante/${idEstudiante}`,
      dto
    );
  }

  // ✅ DELETE por egresado
  delete(idEgresado: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idEgresado}`);
  }
}
