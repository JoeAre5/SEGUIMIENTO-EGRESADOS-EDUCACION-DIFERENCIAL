/*
  Warnings:

  - The primary key for the `Cursacion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[idAsignatura,idPlan,idEstudiante,idCursacion]` on the table `Cursacion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
-- CreateTable
CREATE TABLE IF NOT EXISTS "Egresado" (
  "idEgresado" SERIAL NOT NULL,
  "idEstudiante" INTEGER NOT NULL,
  "fechaEgreso" DATE NOT NULL,
  "situacionActual" TEXT NOT NULL,
  "empresa" TEXT,
  "cargo" TEXT,
  "sueldo" INTEGER,
  "anioIngresoLaboral" INTEGER,
  "anioSeguimiento" INTEGER NOT NULL DEFAULT 2026,
  "telefono" TEXT,
  "emailContacto" TEXT,
  "direccion" TEXT,
  "linkedin" TEXT,
  "contactoAlternativo" TEXT,

  CONSTRAINT "Egresado_pkey" PRIMARY KEY ("idEgresado")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Egresado_idEstudiante_key" ON "Egresado"("idEstudiante");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Egresado_idEstudiante_fkey'
  ) THEN
    ALTER TABLE "Egresado"
    ADD CONSTRAINT "Egresado_idEstudiante_fkey"
    FOREIGN KEY ("idEstudiante") REFERENCES "Estudiante"("idEstudiante")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "DocumentoEgresado" (
  "idDocumento" SERIAL NOT NULL,
  "nombre" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "fechaSubida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "idEgresado" INTEGER NOT NULL,

  CONSTRAINT "DocumentoEgresado_pkey" PRIMARY KEY ("idDocumento")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DocumentoEgresado_idEgresado_idx" ON "DocumentoEgresado"("idEgresado");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'DocumentoEgresado_idEgresado_fkey'
  ) THEN
    ALTER TABLE "DocumentoEgresado"
    ADD CONSTRAINT "DocumentoEgresado_idEgresado_fkey"
    FOREIGN KEY ("idEgresado") REFERENCES "Egresado"("idEgresado")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
