require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);

  const rows = await prisma.$queryRawUnsafe(`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_name ILIKE '%egres%'
    ORDER BY table_schema, table_name;
  `);

  console.log('RESULT:', rows);
  console.log('ROWS:', Array.isArray(rows) ? rows.length : 'not array');
}

main()
  .catch((e) => {
    console.error('ERROR:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('DISCONNECTED');
  });
