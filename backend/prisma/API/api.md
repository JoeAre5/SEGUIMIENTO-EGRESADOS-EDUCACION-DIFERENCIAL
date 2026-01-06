# PLANES-ASIGNATURAS

`GET` "/planes"

> Debería retornar todos los planes registrados de la carrera y las asignaturas que define

Response: type `Planes`

```ts
type Plan = {
  codigo: number;
  titulo: string;
  programa: string; // referencia al programa regular/prosecución
  agnio: number;
  fechaInstauracion: Date;

  Asignaturas: Asignatura[];
};

type Asignatura = {
  codigo: string;
  nombre: string;
  nombreCorto: string;
  unidad: string;
  caracter: string;
  areaFormacion: string;
  creditos: number;
  tributaciones: string[];
  prerrequisitos: string[];
  posicion: number;
  semestre: number;
  competencias: string[];
  descripcion: string;
  linkSyllabus: URL;
};

type Planes = Plan[];
```

`GET` /alumnos/notas/

Response: type `EstudiantesNotas`

> Debería mandar todas las notas semestrales de los alumnos, asociándose correctamente al plan en el que esté y el código de la asignatura

```ts
type Nota = {
  nota: number;
  intento: number;
  grupo: number;
  agnioRendicion: number;
  semestreRelativo: number;
};

type Estudiante = {
  run: string;
  nombreCompleto: string;
  nombreSocial: string;
  agnioIngreso: number;
  notasObtenidas: Nota[];
};

type EstudiantesNotas = Estudiantes[];
```

`GET` /alumnos/notas/agnio/:año/semestre/:semestre

Response: type `EstudiantesNotas`

> Mismo que el anterior pero soportando la carga incremental, es decir, retornaría solo los resultados de ese semestre
