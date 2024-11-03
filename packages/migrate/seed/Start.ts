import { PrismaClient } from "@prisma/client";
import { AppStatusTypes } from "./AppStatusTypes";
import { FetchStatusTypes } from "./FetchStatusTypes";
import { NotifyStatusTypes } from "./NotifyStatusTypes";
import { AdvisorTypes } from "./AdvisorTypes";

const prisma = new PrismaClient();

async function main() {
  await AppStatusTypes();
  await FetchStatusTypes();
  await NotifyStatusTypes();
  await AdvisorTypes();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
