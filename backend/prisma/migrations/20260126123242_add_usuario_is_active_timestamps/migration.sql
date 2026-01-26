/*
  Warnings:

  - A unique constraint covering the columns `[idEstudiante]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_idEstudiante_key" ON "Usuario"("idEstudiante");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_idEstudiante_fkey" FOREIGN KEY ("idEstudiante") REFERENCES "Estudiante"("idEstudiante") ON DELETE SET NULL ON UPDATE CASCADE;
