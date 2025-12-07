import { generateTokens, verifyToken } from '../../utils/jwt'

export default defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, 'refresh_token')

  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No refresh token'
    })
  }

  const payload = await verifyToken(refreshToken)

  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid refresh token'
    })
  }

  // Generate new tokens
  const tokens = await generateTokens(payload.userId, payload.email, payload.isAdmin)

  // Set new cookies
  setCookie(event, 'auth_token', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  })

  setCookie(event, 'refresh_token', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30
  })

  return { success: true }
})
