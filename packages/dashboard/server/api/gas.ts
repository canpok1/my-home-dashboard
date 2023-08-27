import { PrismaClient } from '@prisma/client'

export interface Response {
  labels: string[]
  yens: number[]
  amounts: number[]
  lastUpdated: Date | null
}

export default defineEventHandler(async (event): Promise<Response> => {
  const query = getQuery(event)
  const limit = Number(query.limit)
  if (isNaN(limit)) {
    throw createError({
      statusCode: 400,
      statusMessage: `required query param[limit] is not a number[${query.limit}]`,
    })
  }

  const prisma = new PrismaClient()
  try {
    const usages = await prisma.gas_monthly_usages.findMany({
      take: limit,
      orderBy: [
        {
          usage_year: 'desc',
        },
        {
          usage_month: 'desc',
        },
      ],
    })
    const reversed = usages.reverse()
    const lastUpdated = await prisma.gas_monthly_usages.aggregate({
      _max: {
        updated_at: true,
      },
    })
    return {
      labels: reversed.map((v) => `${v.usage_year}/${v.usage_month}`),
      yens: reversed.map((v) => v.usage_yen),
      amounts: reversed.map((v) => v.usage_amount.toNumber()),
      lastUpdated: lastUpdated._max.updated_at,
    }
  } finally {
    prisma.$disconnect()
  }
})
