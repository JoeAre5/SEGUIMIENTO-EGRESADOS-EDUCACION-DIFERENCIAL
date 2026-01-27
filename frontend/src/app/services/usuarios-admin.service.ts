import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type RoleDto =
  | 'Administrador'
  | 'JC'
  | 'CoordinadorPractica'
  | 'Secretario'
  | 'Docente'
  | 'EGRESADO';

export interface UsuarioAdmin {
  id: number;
  username: string;
  email: string;
  nombreCompleto: string;
  role: RoleDto;
  idEstudiante: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EgresadoSinCuenta {
  idEgresado: number;
  idEstudiante: number;
  Estudiante: {
    rut: string;
    nombreCompleto: string;
  };
}

export interface CreateUsuarioAdminDto {
  username: string;
  email: string;
  nombreCompleto: string;
  password: string;
  role: RoleDto;
  idEstudiante?: number;
}

export interface CreateUsuarioFromEgresadoDto {
  username: string;
  password: string;
  email: string;
  nombreCompleto: string;
  role?: RoleDto; // opcional, backend default EGRESADO
}

@Injectable({ providedIn: 'root' })
export class UsuariosAdminService {
  private apiUrl = 'http://localhost:3000/usuarios';

  constructor(private http: HttpClient) {}

  findAll(): Observable<UsuarioAdmin[]> {
    return this.http.get<UsuarioAdmin[]>(this.apiUrl);
  }

  create(dto: CreateUsuarioAdminDto): Observable<UsuarioAdmin> {
    return this.http.post<UsuarioAdmin>(this.apiUrl, dto);
  }

  egresadosSinCuenta(): Observable<EgresadoSinCuenta[]> {
    return this.http.get<EgresadoSinCuenta[]>(`${this.apiUrl}/egresados/sin-cuenta`);
  }

  createFromEgresado(idEgresado: number, dto: CreateUsuarioFromEgresadoDto): Observable<UsuarioAdmin> {
    return this.http.post<UsuarioAdmin>(`${this.apiUrl}/from-egresado/${idEgresado}`, dto);
  }

  updateUsername(id: number, username: string): Observable<UsuarioAdmin> {
    return this.http.patch<UsuarioAdmin>(`${this.apiUrl}/${id}/username`, { username });
  }

  updatePassword(id: number, password: string): Observable<UsuarioAdmin> {
    return this.http.patch<UsuarioAdmin>(`${this.apiUrl}/${id}/password`, { password });
  }

  updateRole(id: number, role: RoleDto): Observable<UsuarioAdmin> {
    return this.http.patch<UsuarioAdmin>(`${this.apiUrl}/${id}/role`, { role });
  }

  setActive(id: number, isActive: boolean): Observable<UsuarioAdmin> {
    return this.http.patch<UsuarioAdmin>(`${this.apiUrl}/${id}/active/${isActive}`, {});
  }
}
