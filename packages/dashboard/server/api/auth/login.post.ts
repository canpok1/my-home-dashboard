import zod from 'zod'
import jwt from 'jsonwebtoken'

export const SECRET = 'dummy'

export default eventHandler(async (event) => {
  const result = zod
    .object({
      username: zod.string().min(1),
      password: zod.literal('password'),
    })
    .safeParse(await readBody(event))
  if (!result.success) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Unauthorized, hint: try `password` as password',
    })
  }

  const expiresIn = 15
  const { username } = result.data
  const user = {
    username,
  }

  const accessToken = jwt.sign(user, SECRET, {
    expiresIn,
  })

  return {
    token: accessToken,
  }
})
