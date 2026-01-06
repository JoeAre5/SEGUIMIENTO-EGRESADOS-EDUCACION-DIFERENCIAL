export interface ConvenioLista {
  idConvenio: number;
  imagen: string;
  nombreConvenio: string;
  centroPractica: string;
  inicio: Date;
  nombreModalidad: string;
}

export interface Convenio {
  id: number;
  titulo: string;
  centroPractica: string;
  fechaInicioConvenio: Date;
  fechaFinConvenio: Date;
  validez: boolean;
  documentoConvenio: string;
  urlFoto?: string;
  idModalidad: number;
  Modalidad: Modalidad;
  nombreModalidad?: string
}

export interface DetalleConvenio {
  convenio: Convenio;
  nroPracticasRealizadas: number;
  promedioPracticas: number;
  porcentajeAprobacion: number;
  porcentajeReprobacion: number;
}

export interface Modalidad {
  idModalidad: string;
  nombreModalidad: string;
}

export interface CreateConvenioDTO {
  titulo: string;
  centroPractica: string;
  fechaInicioConvenio: Date;
  fechaFinConvenio?: Date;
  documentoConvenio?: string; 
  urlFoto?: string;  
  idModalidad: number;
  nombreModalidad?: string
}

export interface Convenios{
  listadoConvenios: ConvenioLista[];
  modalidades: Modalidad[];
}

export interface ActualizarConvenio{
  titulo?: string;
  centroPractica?: string;
  fechaInicioConvenio?: Date;
  fechaFinConvenio?: Date;
  documentoConvenio?: string;
  urlFoto?: string;
  idModalidad?: number;
  nombreModalidad?: string;
}