import { PrismaClient } from '@prisma/client'

export interface Response {
  labels: string[]
  yens: number[]
  kwhs: number[]
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
    if (query.term === 'monthly') {
      return await findMonthly(prisma, limit)
    }
    if (query.term === 'daily') {
      return await findDaily(prisma, limit)
    }
    throw createError({
      statusCode: 400,
      statusMessage: `query param[term] is invalid value[${query.term}]`,
    })
  } finally {
    prisma.$disconnect()
  }
})

async function findMonthly(
  prisma: PrismaClient,
  limit: number
): Promise<Response> {
  const usages = await prisma.electricity_monthly_usages.findMany({
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
  const lastUpdated = await prisma.electricity_monthly_usages.aggregate({
    _max: {
      updated_at: true,
    },
  })

  return {
    labels: reversed.map((v) => `${v.usage_year}/${v.usage_month}`),
    yens: reversed.map((v) => v.usage_yen),
    kwhs: reversed.map((v) => v.usage_kwh),
    lastUpdated: lastUpdated._max.updated_at,
  }
}

async function findDaily(
  prisma: PrismaClient,
  limit: number
): Promise<Response> {
  const usages = await prisma.electricity_daily_usages.findMany({
    take: limit,
    orderBy: [
      {
        usage_year: 'desc',
      },
      {
        usage_month: 'desc',
      },
      {
        usage_date: 'desc',
      },
    ],
  })
  const reversed = usages.reverse()
  const lastUpdated = await prisma.electricity_daily_usages.aggregate({
    _max: {
      updated_at: true,
    },
  })
  return {
    labels: reversed.map(
      (v) => `${v.usage_year}/${v.usage_month}/${v.usage_date}`
    ),
    yens: [],
    kwhs: reversed.map((v) => Number(v.usage_amount)),
    lastUpdated: lastUpdated._max.updated_at,
  }
}
