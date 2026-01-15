-- DropForeignKey
ALTER TABLE "DocumentoEgresado" DROP CONSTRAINT "DocumentoEgresado_idEgresado_fkey";

-- AlterTable
ALTER TABLE "Egresado" ADD COLUMN     "nivelRentas" TEXT,
ADD COLUMN     "situacionActualOtro" TEXT,
ALTER COLUMN "fechaEgreso" DROP NOT NULL;
