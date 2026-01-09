export interface DocumentoEgresado {
  idDocumento: number;
  nombre: string;
  url: string;
  fechaSubida: string;
}

export interface Egresado {
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

  documentos: DocumentoEgresado[];
}
