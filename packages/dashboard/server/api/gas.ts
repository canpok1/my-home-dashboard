import { PrismaClient } from '@prisma/client'

export interface Response {
  labels: string[]
  yens: number[]
  amounts: number[]
}

export default defineEventHandler(async (): Promise<Response> => {
  const prisma = new PrismaClient()
  try {
    const usages = await prisma.gas_monthly_usages.findMany()
    return {
      labels: usages.map((v) => `${v.usage_year}/${v.usage_month}`),
      yens: usages.map((v) => v.usage_yen),
      amounts: usages.map((v) => v.usage_amount.toNumber()),
    }
  } finally {
    prisma.$disconnect()
  }
})
