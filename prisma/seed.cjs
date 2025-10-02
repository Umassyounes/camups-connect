// prisma/seed.cjs (CommonJS)
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Example seed data — adjust for your models
  // Create a single user if none exist
  const count = await prisma.user.count().catch(() => 0);
  if (count === 0) {
    await prisma.user.create({
      data: {
        email: 'alice@example.com',
        name: 'Alice',
      },
    });
    console.log('Seeded: 1 user');
  } else {
    console.log('Users already present, skipping.');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
