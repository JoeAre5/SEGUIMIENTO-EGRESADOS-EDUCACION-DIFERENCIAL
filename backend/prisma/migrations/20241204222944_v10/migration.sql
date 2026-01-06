/*
  Warnings:

  - The primary key for the `LineaAsignatura` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[idPlan,titulo]` on the table `LineaAsignatura` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idPlan` to the `Estudiante` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idPlan` to the `LineaAsignatura` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Asignatura" DROP CONSTRAINT "Asignatura_idLinea_fkey";

-- DropIndex
DROP INDEX "LineaAsignatura_titulo_key";

-- AlterTable
ALTER TABLE "Convenio" ALTER COLUMN "fechaFinConvenio" SET DEFAULT now() + interval '1000 years';

-- AlterTable
ALTER TABLE "Estudiante" ADD COLUMN     "idPlan" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "LineaAsignatura" DROP CONSTRAINT "LineaAsignatura_pkey",
ADD COLUMN     "color" TEXT,
ADD COLUMN     "idPlan" INTEGER NOT NULL,
ADD CONSTRAINT "LineaAsignatura_pkey" PRIMARY KEY ("idPlan", "idLinea");

-- AlterTable
ALTER TABLE "Modalidad" ALTER COLUMN "fechaDesuso" SET DEFAULT now() + interval '1000 years';

-- CreateIndex
CREATE UNIQUE INDEX "LineaAsignatura_idPlan_titulo_key" ON "LineaAsignatura"("idPlan", "titulo");

-- AddForeignKey
ALTER TABLE "Asignatura" ADD CONSTRAINT "Asignatura_idPlan_idLinea_fkey" FOREIGN KEY ("idPlan", "idLinea") REFERENCES "LineaAsignatura"("idPlan", "idLinea") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineaAsignatura" ADD CONSTRAINT "LineaAsignatura_idPlan_fkey" FOREIGN KEY ("idPlan") REFERENCES "Plan"("idPlan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estudiante" ADD CONSTRAINT "Estudiante_idPlan_fkey" FOREIGN KEY ("idPlan") REFERENCES "Plan"("idPlan") ON DELETE RESTRICT ON UPDATE CASCADE;
