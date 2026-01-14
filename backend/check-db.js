const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // OJO: estos nombres dependen de cómo Prisma generó el client.
  // Lo más probable es que sean en minúscula: estudiante, usuario, cursacion.
  const estudiantes = await prisma.estudiante.count();
  const usuarios = await prisma.usuario.count();
  const cursaciones = await prisma.cursacion.count();

  console.log({ estudiantes, usuarios, cursaciones });
}

main()
  .catch((e) => {
    console.error("ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
