export interface ListaAsignatura {
    idAsignatura: number;
    codigo: string;
    nombre: string;
    semestreRealizacion: number[];
    planesDondeSeImparte: string[];
    formacion: string[];           
}