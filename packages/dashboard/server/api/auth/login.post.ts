import zod from 'zod'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { HashValue } from 'lib/src/Hash'

export const SECRET = 'dummy'
const EXPIRES_SEC = 6 * 60 * 60

export default eventHandler(async (event) => {
  const result = zod
    .object({
      username: zod.string().min(1),
      password: zod.string().min(1),
    })
    .safeParse(await readBody(event))
  if (!result.success) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized, validation error',
    })
  }
  const { username, password } = result.data

  const prisma = new PrismaClient()
  const adminUser = await prisma.admin_users.findUnique({
    where: {
      user_name: username,
    },
  })
  if (adminUser === null) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized, admin user not found',
    })
  }

  const hash = HashValue.makeFromSerializedText(adminUser.password_hash)
  if (!hash.isMatch(password)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized, password is not match',
    })
  }

  const user = {
    username,
  }

  const accessToken = jwt.sign(user, SECRET, {
    expiresIn: EXPIRES_SEC,
  })

  return {
    token: accessToken,
  }
})
