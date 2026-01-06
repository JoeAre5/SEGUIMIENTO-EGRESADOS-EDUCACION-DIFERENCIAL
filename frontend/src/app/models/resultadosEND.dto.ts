export interface ResultadosEnd {
  idDato: number;
  agnoRendicion: number;
  cohorteAsociado: number;
  rutaDocumento: string;
  fechaSubida: Date;
}

export interface NuevoEND{
  agnoRendicion: string;
  cohorteAsociado: string;
}