/*
  Warnings:

  - You are about to drop the column `fechaDesuso` on the `Modalidad` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PTConvenio" DROP CONSTRAINT "PTConvenio_idAsignatura_idPlan_idEstudiante_idCursacion_fkey";

-- DropForeignKey
ALTER TABLE "PracticaTomada" DROP CONSTRAINT "PracticaTomada_idAsignatura_idPlan_idEstudiante_idCursacio_fkey";

-- AlterTable
ALTER TABLE "Modalidad" DROP COLUMN "fechaDesuso",
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "fechaFinValidez" DATE DEFAULT (now() + '1000 years'::interval),
ADD COLUMN     "fechaInicioValidez" DATE DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "PracticaTomada" ADD CONSTRAINT "PracticaTomada_idCursacion_idEstudiante_idAsignatura_idPla_fkey" FOREIGN KEY ("idCursacion", "idEstudiante", "idAsignatura", "idPlan") REFERENCES "Cursacion"("idCursacion", "idEstudiante", "idAsignatura", "idPlan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PTConvenio" ADD CONSTRAINT "PTConvenio_idPlan_idAsignatura_idEstudiante_idCursacion_fkey" FOREIGN KEY ("idPlan", "idAsignatura", "idEstudiante", "idCursacion") REFERENCES "PracticaTomada"("idPlan", "idAsignatura", "idEstudiante", "idCursacion") ON DELETE RESTRICT ON UPDATE CASCADE;
