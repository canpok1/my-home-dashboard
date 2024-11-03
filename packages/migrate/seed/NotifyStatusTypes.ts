import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function NotifyStatusTypes(): Promise<void> {
  const records = [
    { id: 0, type_name: "success" },
    { id: 1, type_name: "failure" },
  ];
  for (const record of records) {
    await prisma.notify_status_types.upsert({
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
