-- AlterTable
ALTER TABLE "Egresado" ADD COLUMN     "consentimientoEstado" TEXT NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "consentimientoFecha" TIMESTAMP(3);
