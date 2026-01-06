-- CreateEnum
CREATE TYPE "CARACTER" AS ENUM ('NORMAL', 'ELECTIVO', 'PRACTICA', 'TITULACION');

-- CreateEnum
CREATE TYPE "AREA" AS ENUM ('FP', 'FG', 'FE', 'FB');

-- CreateEnum
CREATE TYPE "EstadoAprobacion" AS ENUM ('APROBADO', 'DESAPROBADO');

-- CreateEnum
CREATE TYPE "NIVEL" AS ENUM ('BASICA', 'MEDIA', 'SUPERIOR');

-- CreateTable
CREATE TABLE "Asignatura" (
    "idAsignatura" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nombreCorto" TEXT NOT NULL,
    "unidad" TEXT,
    "caracter" "CARACTER" NOT NULL,
    "areaFormacion" "AREA" NOT NULL,
    "creditos" INTEGER NOT NULL,
    "tributaciones" INTEGER[],
    "prerrequisitos" INTEGER[],
    "posicion" INTEGER NOT NULL,
    "semestre" INTEGER NOT NULL,
    "competencias" TEXT[],
    "descripcion" TEXT,
    "linkSyllabus" TEXT,
    "idPlan" INTEGER NOT NULL,
    "idLinea" INTEGER,

    CONSTRAINT "Asignatura_pkey" PRIMARY KEY ("idPlan","idAsignatura")
);

-- CreateTable
CREATE TABLE "LineaAsignatura" (
    "idLinea" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,

    CONSTRAINT "LineaAsignatura_pkey" PRIMARY KEY ("idLinea")
);

-- CreateTable
CREATE TABLE "ResultadoEND" (
    "resultados" JSONB NOT NULL,
    "idEND" INTEGER NOT NULL,
    "idEstudiante" INTEGER NOT NULL,

    CONSTRAINT "ResultadoEND_pkey" PRIMARY KEY ("idEND","idEstudiante")
);

-- CreateTable
CREATE TABLE "END" (
    "idEND" INTEGER NOT NULL,
    "fechaRendicion" DATE NOT NULL,
    "formato" JSONB NOT NULL,

    CONSTRAINT "END_pkey" PRIMARY KEY ("idEND")
);

-- CreateTable
CREATE TABLE "Estudiante" (
    "idEstudiante" SERIAL NOT NULL,
    "rut" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "nombreSocial" TEXT NOT NULL,
    "agnioIngreso" INTEGER NOT NULL,

    CONSTRAINT "Estudiante_pkey" PRIMARY KEY ("idEstudiante")
);

-- CreateTable
CREATE TABLE "Cursacion" (
    "idCursacion" SERIAL NOT NULL,
    "notaFinal" DOUBLE PRECISION NOT NULL,
    "numIntento" INTEGER NOT NULL DEFAULT 1,
    "grupo" TEXT NOT NULL DEFAULT 'A',
    "agnio" INTEGER NOT NULL,
    "semestreRelativo" INTEGER NOT NULL DEFAULT 1,
    "idPlan" INTEGER NOT NULL,
    "idAsignatura" INTEGER NOT NULL,
    "idEstudiante" INTEGER NOT NULL,

    CONSTRAINT "Cursacion_pkey" PRIMARY KEY ("idCursacion","idEstudiante","idAsignatura","idPlan")
);

-- CreateTable
CREATE TABLE "Plan" (
    "idPlan" SERIAL NOT NULL,
    "codigo" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "agnio" INTEGER NOT NULL,
    "fechaInstauracion" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("idPlan")
);

-- CreateTable
CREATE TABLE "PracticaTomada" (
    "fechaInicio" DATE NOT NULL,
    "fechaTermino" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultadoDiagnostico" JSONB NOT NULL,
    "resultado" "EstadoAprobacion" NOT NULL DEFAULT 'APROBADO',
    "idPlan" INTEGER NOT NULL,
    "idAsignatura" INTEGER NOT NULL,
    "idEstudiante" INTEGER NOT NULL,
    "idCursacion" INTEGER NOT NULL,

    CONSTRAINT "PracticaTomada_pkey" PRIMARY KEY ("idPlan","idAsignatura","idEstudiante","idCursacion")
);

-- CreateTable
CREATE TABLE "PTConvenio" (
    "nivel" "NIVEL" NOT NULL,
    "idPlan" INTEGER NOT NULL,
    "idAsignatura" INTEGER NOT NULL,
    "idEstudiante" INTEGER NOT NULL,
    "idCursacion" INTEGER NOT NULL,
    "idConvenio" INTEGER NOT NULL,

    CONSTRAINT "PTConvenio_pkey" PRIMARY KEY ("idPlan","idAsignatura","idEstudiante","idCursacion","idConvenio")
);

-- CreateTable
CREATE TABLE "Convenio" (
    "idConvenio" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "centroPractica" TEXT NOT NULL,
    "fechaInicioConvenio" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFinConvenio" DATE NOT NULL DEFAULT now() + interval '1000 years',
    "validez" BOOLEAN NOT NULL DEFAULT true,
    "documentoConvenio" TEXT,
    "urlFoto" TEXT,
    "idModalidad" INTEGER NOT NULL,

    CONSTRAINT "Convenio_pkey" PRIMARY KEY ("idConvenio")
);

-- CreateTable
CREATE TABLE "Modalidad" (
    "idModalidad" SERIAL NOT NULL,
    "nombreModalidad" TEXT NOT NULL,
    "fechaCreacion" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaDesuso" DATE DEFAULT now() + interval '1000 years',
    "validez" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Modalidad_pkey" PRIMARY KEY ("idModalidad")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asignatura_codigo_key" ON "Asignatura"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Asignatura_nombre_key" ON "Asignatura"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Asignatura_nombreCorto_key" ON "Asignatura"("nombreCorto");

-- CreateIndex
CREATE UNIQUE INDEX "LineaAsignatura_titulo_key" ON "LineaAsignatura"("titulo");

-- CreateIndex
CREATE UNIQUE INDEX "ResultadoEND_idEstudiante_key" ON "ResultadoEND"("idEstudiante");

-- CreateIndex
CREATE UNIQUE INDEX "Estudiante_rut_key" ON "Estudiante"("rut");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_codigo_key" ON "Plan"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_titulo_key" ON "Plan"("titulo");

-- CreateIndex
CREATE UNIQUE INDEX "Convenio_titulo_key" ON "Convenio"("titulo");

-- CreateIndex
CREATE UNIQUE INDEX "Modalidad_nombreModalidad_key" ON "Modalidad"("nombreModalidad");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Asignatura" ADD CONSTRAINT "Asignatura_idPlan_fkey" FOREIGN KEY ("idPlan") REFERENCES "Plan"("idPlan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asignatura" ADD CONSTRAINT "Asignatura_idLinea_fkey" FOREIGN KEY ("idLinea") REFERENCES "LineaAsignatura"("idLinea") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultadoEND" ADD CONSTRAINT "ResultadoEND_idEND_fkey" FOREIGN KEY ("idEND") REFERENCES "END"("idEND") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResultadoEND" ADD CONSTRAINT "ResultadoEND_idEstudiante_fkey" FOREIGN KEY ("idEstudiante") REFERENCES "Estudiante"("idEstudiante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cursacion" ADD CONSTRAINT "Cursacion_idAsignatura_idPlan_fkey" FOREIGN KEY ("idAsignatura", "idPlan") REFERENCES "Asignatura"("idAsignatura", "idPlan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cursacion" ADD CONSTRAINT "Cursacion_idEstudiante_fkey" FOREIGN KEY ("idEstudiante") REFERENCES "Estudiante"("idEstudiante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticaTomada" ADD CONSTRAINT "PracticaTomada_idAsignatura_idPlan_idEstudiante_idCursacio_fkey" FOREIGN KEY ("idAsignatura", "idPlan", "idEstudiante", "idCursacion") REFERENCES "Cursacion"("idAsignatura", "idPlan", "idEstudiante", "idCursacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PTConvenio" ADD CONSTRAINT "PTConvenio_idAsignatura_idPlan_idEstudiante_idCursacion_fkey" FOREIGN KEY ("idAsignatura", "idPlan", "idEstudiante", "idCursacion") REFERENCES "PracticaTomada"("idAsignatura", "idPlan", "idEstudiante", "idCursacion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PTConvenio" ADD CONSTRAINT "PTConvenio_idConvenio_fkey" FOREIGN KEY ("idConvenio") REFERENCES "Convenio"("idConvenio") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convenio" ADD CONSTRAINT "Convenio_idModalidad_fkey" FOREIGN KEY ("idModalidad") REFERENCES "Modalidad"("idModalidad") ON DELETE RESTRICT ON UPDATE CASCADE;
