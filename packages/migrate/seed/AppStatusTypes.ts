import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function AppStatusTypes(): Promise<void> {
  const records = [
    { id: 0, type_name: "stopped" },
    { id: 1, type_name: "running" },
    { id: 2, type_name: "error" },
  ];
  for (const record of records) {
    await prisma.app_status_types.upsert({
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
