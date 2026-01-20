-- AlterTable
ALTER TABLE "Egresado" ADD COLUMN     "anioFinEstudios" INTEGER,
ADD COLUMN     "anioIngresoCarrera" INTEGER,
ADD COLUMN     "genero" TEXT,
ADD COLUMN     "sectorLaboral" TEXT,
ADD COLUMN     "sectorLaboralOtro" TEXT,
ADD COLUMN     "tiempoBusquedaTrabajo" TEXT,
ADD COLUMN     "tipoEstablecimiento" TEXT,
ADD COLUMN     "tipoEstablecimientoOtro" TEXT,
ADD COLUMN     "viaIngreso" TEXT,
ADD COLUMN     "viaIngresoOtro" TEXT;

-- AddForeignKey
ALTER TABLE "DocumentoEgresado" ADD CONSTRAINT "DocumentoEgresado_idEgresado_fkey" FOREIGN KEY ("idEgresado") REFERENCES "Egresado"("idEgresado") ON DELETE RESTRICT ON UPDATE CASCADE;
