import { PrismaClient } from '@prisma/client'

export interface Response {
  monthlyUsages: {
    date: string
    beginAt: string
    endAt: string
    yen: number
    amount: number
  }[]
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
    const usages = await prisma.water_monthly_usages.findMany({
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
    const lastUpdated = await prisma.water_monthly_usages.aggregate({
      _max: {
        updated_at: true,
      },
    })
    return {
      monthlyUsages: usages.map((v) => {
        return {
          date: formatMonthlyLabel(v.usage_year, v.usage_month),
          beginAt: formatDateJst(v.usage_begin_at, 'YYYY/MM/DD'),
          endAt: formatDateJst(v.usage_end_at, 'YYYY/MM/DD'),
          yen: v.usage_yen,
          amount: Number(v.usage_amount),
        }
      }),
      lastUpdated: lastUpdated._max.updated_at,
    }
  } finally {
    prisma.$disconnect()
  }
})
