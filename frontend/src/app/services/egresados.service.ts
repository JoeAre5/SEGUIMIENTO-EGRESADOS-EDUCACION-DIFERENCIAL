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

  // ✅ datos de contacto
  telefono?: string;
  emailContacto?: string;

  // ✅ nuevos campos prisma
  linkedin?: string;
  direccion?: string;
  contactoAlternativo?: string;
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

  /* ===========================
   ✅ CREAR con archivos
   ✅ POST /egresados
  =========================== */
  createWithFiles(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  /* ===========================
   ✅ LISTAR TODOS
   ✅ GET /egresados
  =========================== */
  findAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /* ===========================
   ✅ BUSCAR POR ESTUDIANTE
   ✅ GET /egresados/estudiante/:idEstudiante
  =========================== */
  findOneByEstudiante(idEstudiante: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/estudiante/${idEstudiante}`);
  }

  /* ===========================
   ✅ UPDATE SOLO TEXTO
   ✅ PATCH /egresados/estudiante/:idEstudiante
  =========================== */
  updateByEstudiante(idEstudiante: number, dto: UpdateEgresadoDto): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/estudiante/${idEstudiante}`, dto);
  }

  /* ===========================
   ✅ UPDATE CON ARCHIVOS ✅
   ✅ PATCH /egresados/estudiante/:idEstudiante
   ✅ Sirve para agregar documentos sin borrar los anteriores
  =========================== */
  updateWithFilesByEstudiante(idEstudiante: number, formData: FormData): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/estudiante/${idEstudiante}`, formData);
  }

  /* ===========================
   ✅ ELIMINAR POR idEgresado
   ✅ DELETE /egresados/:idEgresado
  =========================== */
  delete(idEgresado: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${idEgresado}`);
  }

  /* ===========================
   ✅ DOCUMENTOS
  =========================== */

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
