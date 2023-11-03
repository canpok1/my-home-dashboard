import { PrismaClient } from '@prisma/client'

export interface Cost {
  date: string
  yen: number
}

export interface Request {
  type: string
  costs: Cost[]
}

export default defineEventHandler(async (event) => {
  const prisma = new PrismaClient()
  try {
    const body = await readBody<Request>(event)

    const costType = await prisma.cost_types.findUnique({
      where: {
        type_name: body.type,
      },
    })

    let costTypeId: bigint
    if (costType) {
      costTypeId = costType.id
    } else {
      const newCostType = await prisma.cost_types.create({
        data: {
          type_name: body.type,
        },
      })
      costTypeId = newCostType.id
    }

    for (const cost of body.costs) {
      const { year, month } = extractDatetimeElementJst(new Date(cost.date))
      await prisma.monthly_costs.upsert({
        where: {
          cost_type_id_cost_year_cost_month: {
            cost_type_id: costTypeId,
            cost_year: year,
            cost_month: month,
          },
        },
        create: {
          cost_type_id: costTypeId,
          cost_year: year,
          cost_month: month,
          cost_yen: cost.yen,
        },
        update: {
          cost_yen: cost.yen,
        },
      })
    }
    return {
      count: body.costs.length,
    }
  } catch (e) {
    console.log(e)
    throw createError({
      statusCode: 500,
      statusMessage: 'error occured',
    })
  } finally {
    prisma.$disconnect()
  }
})
