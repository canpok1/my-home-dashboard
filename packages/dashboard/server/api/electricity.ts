// import { PrismaClient } from '@prisma/client'

export default defineEventHandler(() => {
  return {
    message: 'hello world!',
  }
  // const prisma = new PrismaClient()
  // try {
  //  return await prisma.electricity_monthly_usages.findMany()
  // } catch (e) {
  //  console.error(e)
  // } finally {
  //  prisma.$disconnect()
  // }
})
