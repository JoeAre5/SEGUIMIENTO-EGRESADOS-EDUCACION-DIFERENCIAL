export interface PostResultadoENDDTO {
  cohorteAsociado: number;
  agnoRendicion: number;
  fechaSubida: Date;
}

export interface PatchResultadoENDDTO extends PostResultadoENDDTO {
  idDato: number;
}
