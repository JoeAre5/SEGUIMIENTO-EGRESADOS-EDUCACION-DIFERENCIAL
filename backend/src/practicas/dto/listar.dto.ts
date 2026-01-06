export interface ListarConvenioDTO {
  idConvenio: number;
  imagen: string;
  nombreConvenio: string;
  centroPractica: string;
  inicio: Date;
  nombreModalidad: string;
  modalidadesDisponibles?: { idModalidad: number; nombre: string };
}
