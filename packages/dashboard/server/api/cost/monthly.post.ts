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
    console.log('received: %j', body)

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

    type Record = {
      year: number
      month: number
      yen: number
    }
    const records = new Map<string, Record>()
    for (const cost of body.costs) {
      const { year, month } = extractDatetimeElementJst(new Date(cost.date))
      const key = `${year}-${month}`

      const record = records.get(key)
      if (record) {
        record.yen = record.yen + cost.yen
        records.set(key, record)
      } else {
        records.set(key, {
          year,
          month,
          yen: cost.yen,
        })
      }
    }

    for (const record of records.values()) {
      await prisma.monthly_costs.upsert({
        where: {
          cost_type_id_cost_year_cost_month: {
            cost_type_id: costTypeId,
            cost_year: record.year,
            cost_month: record.month,
          },
        },
        create: {
          cost_type_id: costTypeId,
          cost_year: record.year,
          cost_month: record.month,
          cost_yen: record.yen,
        },
        update: {
          cost_yen: record.yen,
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
