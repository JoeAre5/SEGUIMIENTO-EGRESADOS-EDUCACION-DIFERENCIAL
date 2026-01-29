import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


 // DTOs


export interface UpdateEgresadoDto {
  fechaEgreso?: string;
  situacionActual?: string;
  empresa?: string;
  cargo?: string;
  sueldo?: number;
  anioIngresoLaboral?: number;
  anioSeguimiento?: number;

  // datos de contacto
  telefono?: string;
  emailContacto?: string;

  // nuevos campos prisma
  linkedin?: string;
  direccion?: string;
  contactoAlternativo?: string;
}

// SERVICE

@Injectable({
  providedIn: 'root',
})
export class EgresadosService {
  // Mantengo tus URLs EXACTAS
  private apiUrl = 'http://localhost:3000/egresados';
  private apiFilesUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}


   //agrega Bearer token si existe en storage

  private getAuthHeaders(): HttpHeaders | undefined {
    try {
      const token =
        localStorage.getItem('access_token') ||
        localStorage.getItem('token') ||
        sessionStorage.getItem('access_token') ||
        sessionStorage.getItem('token');

      if (!token) return undefined;

      return new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
    } catch {
      // SSR o storage bloqueado
      return undefined;
    }
  }

  /* ===========================
    CREAR con archivos
    POST /egresados
  =========================== */
  createWithFiles(formData: FormData): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(this.apiUrl, formData, headers ? { headers } : {});
  }

  /* ===========================
    LISTAR TODOS
    GET /egresados
  =========================== */
  findAll(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(this.apiUrl, headers ? { headers } : {});
  }

  /* ===========================
    BUSCAR POR ESTUDIANTE
    GET /egresados/estudiante/:idEstudiante
  =========================== */
  findOneByEstudiante(idEstudiante: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/estudiante/${idEstudiante}`, headers ? { headers } : {});
  }

  /* ===========================
    DASHBOARD POR COHORTE 
    GET /egresados/dashboard/cohortes
  =========================== */
  getDashboardCohortes(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/dashboard/cohortes`, headers ? { headers } : {});
  }

  /* ===========================
    UPDATE SOLO TEXTO
    PATCH /egresados/estudiante/:idEstudiante
  =========================== */
  updateByEstudiante(idEstudiante: number, dto: UpdateEgresadoDto): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch<any>(`${this.apiUrl}/estudiante/${idEstudiante}`, dto, headers ? { headers } : {});
  }

  /* ===========================
    UPDATE CON ARCHIVOS 
    PATCH /egresados/estudiante/:idEstudiante
    Sirve para agregar documentos sin borrar los anteriores
  =========================== */
  updateWithFilesByEstudiante(idEstudiante: number, formData: FormData): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch<any>(`${this.apiUrl}/estudiante/${idEstudiante}`, formData, headers ? { headers } : {});
  }

  /* ===========================
    ELIMINAR POR idEgresado
    DELETE /egresados/:idEgresado
  =========================== */
  delete(idEgresado: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(`${this.apiUrl}/${idEgresado}`, headers ? { headers } : {});
  }


    // DOCUMENTOS


  //  genera URL completa
  getDocumentoUrl(path: string): string {
    return `${this.apiFilesUrl}${path}`;
  }

  //  descarga como blob (forzada)
  downloadDocumento(url: string): Observable<Blob> {
    const headers = this.getAuthHeaders();
    const fullUrl = this.getDocumentoUrl(url);
    return this.http.get(fullUrl, {
      responseType: 'blob',
      ...(headers ? { headers } : {}),
    });
  }

  /* ===========================
    ELIMINAR DOCUMENTO INDIVIDUAL 
    DELETE /egresados/documento/:idDocumento
  =========================== */
  deleteDocumento(idDocumento: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(`${this.apiUrl}/documento/${idDocumento}`, headers ? { headers } : {});
  }

  /* ===========================
    NUEVO (EGRESADO): ELIMINAR DOCUMENTO PROPIO 
    DELETE /egresados/mine/documento/:idDocumento
  =========================== */
  deleteDocumentoMine(idDocumento: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete<any>(`${this.apiUrl}/mine/documento/${idDocumento}`, headers ? { headers } : {});
  }

  /* ===========================
    NUEVO: LISTAR PLANES DE ESTUDIO 
    GET /planes-de-estudio
  =========================== */
  getPlanesEstudio(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(`${this.apiFilesUrl}/planes-de-estudio`, headers ? { headers } : {});
  }


  // ENDPOINTS PARA ROL EGRESADO


  //  GET /egresados/mine
  findMine(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/mine`, headers ? { headers } : {});
  }

  getMine(): Observable<any> {
    return this.findMine();
  }

  //  POST /egresados/mine (SIN docs)
  // (Tu componente lo usa cuando no adjuntas archivos)
  createMine(dto: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/mine`, dto, headers ? { headers } : {});
  }

  //  PATCH /egresados/mine (SIN docs)
  updateMine(dto: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch<any>(`${this.apiUrl}/mine`, dto, headers ? { headers } : {});
  }

  // POST /egresados/mine (con docs)
  createMineWithFiles(formData: FormData): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.apiUrl}/mine`, formData, headers ? { headers } : {});
  }

  // PATCH /egresados/mine (con docs)
  updateMineWithFiles(formData: FormData): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch<any>(`${this.apiUrl}/mine`, formData, headers ? { headers } : {});
  }

  /* ===========================
   CONSENTIMIENTO (EGRESADO)
   GET/PATCH /egresados/mine/consentimiento
  =========================== */

  getConsentimientoMine(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/mine/consentimiento`, headers ? { headers } : {});
  }

  setConsentimientoMine(acepta: boolean): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.patch<any>(
      `${this.apiUrl}/mine/consentimiento`,
      { acepta },
      headers ? { headers } : {}
    );
  }
}
