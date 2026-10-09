import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SERVICES = [
  { name: 'Patient Care-Male', abbreviation: 'PCM' },
  { name: 'Patient Care-Female', abbreviation: 'PCF' },
  { name: 'House Maid', abbreviation: 'HM' },
  { name: 'Baby Care', abbreviation: 'BC' },
  { name: 'Delivery Care', abbreviation: 'DC' },
  { name: 'Hospital Bystander', abbreviation: 'HB' },
  { name: 'Physiotherapy', abbreviation: 'PY' },
  { name: 'Nurse Visit', abbreviation: 'NV' },
];

async function main() {
  for (const service of SERVICES) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: {},
      create: service,
    });
  }
  console.log(`Seeded ${SERVICES.length} services.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
