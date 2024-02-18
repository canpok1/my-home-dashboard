import { createSecretKey } from 'crypto'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { HashValue } from 'lib/src/Hash'
import * as jose from 'jose'

export const SECRET = 'dummy'
const EXPIRES_HOUR = 6 * 60 * 60

export default eventHandler(async (event) => {
  const result = z
    .object({
      username: z.string().min(1),
      password: z.string().min(1),
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

  const accessToken = await new jose.SignJWT(user)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('urn:example:issuer')
    .setAudience('urn:example:audience')
    .setExpirationTime(EXPIRES_HOUR + 'h')
    .sign(createSecretKey(SECRET, 'utf-8'))

  return {
    token: accessToken,
  }
})
