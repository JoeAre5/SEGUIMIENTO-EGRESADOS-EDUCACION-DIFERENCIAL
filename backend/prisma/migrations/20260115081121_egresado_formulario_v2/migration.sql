/*
  Warnings:

  - The primary key for the `Cursacion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[idAsignatura,idPlan,idEstudiante,idCursacion]` on the table `Cursacion` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "DocumentoEgresado" DROP CONSTRAINT "DocumentoEgresado_idEgresado_fkey";

-- AlterTable
ALTER TABLE "Cursacion" DROP CONSTRAINT "Cursacion_pkey",
ADD CONSTRAINT "Cursacion_pkey" PRIMARY KEY ("idCursacion");

-- AlterTable
ALTER TABLE "Egresado" ADD COLUMN     "cargoOrganizacion" TEXT,
ADD COLUMN     "cargoOrganizacionOtro" TEXT,
ADD COLUMN     "genero" TEXT,
ADD COLUMN     "nivelRentas" TEXT,
ADD COLUMN     "planProgramaIngreso" TEXT,
ADD COLUMN     "sectorLaboral" TEXT,
ADD COLUMN     "sectorLaboralOtro" TEXT,
ADD COLUMN     "tiempoEncontrarTrabajo" TEXT,
ADD COLUMN     "trabajaEnEstablecimiento" TEXT,
ADD COLUMN     "trabajaEnEstablecimientoOtro" TEXT,
ADD COLUMN     "viaIngreso" TEXT,
ADD COLUMN     "viaIngresoOtro" TEXT,
ALTER COLUMN "fechaEgreso" DROP NOT NULL,
ALTER COLUMN "situacionActual" DROP NOT NULL,
ALTER COLUMN "anioSeguimiento" DROP NOT NULL,
ALTER COLUMN "anioSeguimiento" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PracticaTomada" ALTER COLUMN "fechaTermino" DROP NOT NULL,
ALTER COLUMN "fechaTermino" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Cursacion_idAsignatura_idPlan_idEstudiante_idCursacion_key" ON "Cursacion"("idAsignatura", "idPlan", "idEstudiante", "idCursacion");

-- AddForeignKey
ALTER TABLE "DocumentoEgresado" ADD CONSTRAINT "DocumentoEgresado_idEgresado_fkey" FOREIGN KEY ("idEgresado") REFERENCES "Egresado"("idEgresado") ON DELETE RESTRICT ON UPDATE CASCADE;
