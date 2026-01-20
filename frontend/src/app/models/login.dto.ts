export interface LoginUsuario {
  username: string;
  password: string;
}

export interface RespuestaLogin {
  success: boolean;
  message?: string;
  access_token?: string;
}

// enumerable con los nombre de los roles traidos del backend
export enum Roles {
  JEFA_CARRERA = 'JC',
  DOCENTE = 'Docente',
  SECRETARIO = 'Secretario',
  COORDINADOR = 'CoordinadorPractica',
  ADMINISTRADOR = 'Administrador',
  EGRESADO = 'EGRESADO',
}

export interface DecodedJWT {
  role: string;
  username: string;
  idEstudiante?: number | null;
}
