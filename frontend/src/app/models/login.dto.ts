export interface LoginUsuario {
  username: string;
  password: string;
}

export interface RespuestaLogin {
  // tu LoginService realmente ignora success/message y solo toma el token,
  // pero lo dejamos por compatibilidad
  success?: boolean;
  message?: string;

  // ✅ lo que devuelve tu backend (AuthService.signToken)
  access_token?: string;

  // ✅ por si en algún momento devuelves token en otra key
  token?: string;
}

// enumerable con los nombre de los roles traidos del backend
export const enum Roles {
  JEFA_CARRERA = 'JC',
  DOCENTE = 'Docente',
  SECRETARIO = 'Secretario',
  COORDINADOR = 'CoordinadorPractica',
  ADMINISTRADOR = 'Administrador',

  // ✅ NUEVO: rol estudiante desde backend
  ESTUDIANTE = 'ESTUDIANTE',
}

export interface DecodedJWT {
  sub?: number; // id usuario
  role: string;
  username: string;
  email?: string;

  // ✅ NUEVO: viene desde el token cuando el rol es ESTUDIANTE
  estudianteId?: number | null;

  // opcional: exp/iat si los quieres
  exp?: number;
  iat?: number;
}
