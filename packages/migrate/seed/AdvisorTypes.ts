import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function AdvisorTypes(): Promise<void> {
  const records = [{ id: 0, type_name: "electricity" }];
  for (const record of records) {
    await prisma.advisor_types.upsert({
      where: {
        id: record.id,
      },
      update: {
        type_name: record.type_name,
      },
      create: {
        id: record.id,
        type_name: record.type_name,
      },
    });
  }
}
