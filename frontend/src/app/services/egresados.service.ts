import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/* ===========================
 ✅ DTOs
=========================== */

export interface UpdateEgresadoDto {
  fechaEgreso?: string;
  situacionActual?: string;
  empresa?: string;
  cargo?: string;
  sueldo?: number;
  anioIngresoLaboral?: number;
  anioSeguimiento?: number;
  telefono?: string;
  emailContacto?: string;
}

/* ===========================
 ✅ SERVICE
=========================== */

@Injectable({
  providedIn: 'root',
})
export class EgresadosService {
  private apiUrl = 'http://localhost:3000/egresados';
  private apiFilesUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // ✅ CREAR con archivos
  createWithFiles(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  // ✅ LISTAR
  findAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // ✅ BUSCAR por estudiante
  findOneByEstudiante(idEstudiante: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${idEstudiante}`);
  }

  // ✅ UPDATE por idEstudiante
  updateByEstudiante(idEstudiante: number, dto: UpdateEgresadoDto): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${idEstudiante}`, dto);
  }

  // ✅ ELIMINAR por idEgresado
  delete(idEgresado: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idEgresado}`);
  }

  // ✅ genera URL completa
  getDocumentoUrl(path: string): string {
    return `${this.apiFilesUrl}${path}`;
  }

  // ✅ descarga como blob (forzada)
  downloadDocumento(url: string): Observable<Blob> {
    const fullUrl = this.getDocumentoUrl(url);
    return this.http.get(fullUrl, { responseType: 'blob' });
  }
}
