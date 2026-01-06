/*
  Warnings:

  - A unique constraint covering the columns `[idPlan,codigo]` on the table `Asignatura` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idPlan,nombre]` on the table `Asignatura` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idPlan,nombreCorto]` on the table `Asignatura` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Asignatura_codigo_key";

-- DropIndex
DROP INDEX "Asignatura_nombreCorto_key";

-- DropIndex
DROP INDEX "Asignatura_nombre_key";

-- AlterTable
ALTER TABLE "Convenio" ALTER COLUMN "fechaFinConvenio" SET DEFAULT now() + interval '1000 years';

-- AlterTable
ALTER TABLE "Modalidad" ALTER COLUMN "fechaDesuso" SET DEFAULT now() + interval '1000 years';

-- CreateTable
CREATE TABLE "DocumentoEND" (
    "idDato" SERIAL NOT NULL,
    "rutaDocumento" TEXT NOT NULL,
    "cohorteAsociado" INTEGER NOT NULL,
    "agnoRendicion" INTEGER NOT NULL,
    "fechaSubida" DATE NOT NULL,

    CONSTRAINT "DocumentoEND_pkey" PRIMARY KEY ("idDato")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asignatura_idPlan_codigo_key" ON "Asignatura"("idPlan", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Asignatura_idPlan_nombre_key" ON "Asignatura"("idPlan", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Asignatura_idPlan_nombreCorto_key" ON "Asignatura"("idPlan", "nombreCorto");
