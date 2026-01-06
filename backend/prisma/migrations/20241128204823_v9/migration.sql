-- CreateEnum
CREATE TYPE "ROLE" AS ENUM ('Administrador', 'JC', 'CoordinadorPractica', 'Secretario', 'Docente');

-- AlterTable
ALTER TABLE "Convenio" ALTER COLUMN "fechaFinConvenio" SET DEFAULT now() + interval '1000 years';

-- AlterTable
ALTER TABLE "Modalidad" ALTER COLUMN "fechaDesuso" SET DEFAULT now() + interval '1000 years';

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "role" "ROLE" NOT NULL DEFAULT 'Docente';
