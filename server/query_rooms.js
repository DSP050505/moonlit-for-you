const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rooms = await prisma.room.findMany({
    select: { id: true, name: true, passcode: true }
  });
  console.log("Existing rooms in database:");
  console.dir(rooms);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
