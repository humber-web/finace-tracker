import { googleOAuth } from '../../../utils/oauth'
import { generateState, generateCodeVerifier } from 'arctic' // <-- Import generateCodeVerifier

export default defineEventHandler(async (event) => {
  const provider = getRouterParam(event, 'provider')

  if (!['google', 'github'].includes(provider || '')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid OAuth provider'
    })
  }

  const state = generateState()
  let url: URL

  if (provider === 'google') {
    if (!googleOAuth) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file'
      })
    }
    
    // --- NEW CODE: PKCE Implementation ---
    const codeVerifier = generateCodeVerifier()
    
    url = await googleOAuth.createAuthorizationURL(
      state, 
      codeVerifier, // <-- Second positional argument: codeVerifier
      ['openid', 'profile', 'email'] // <-- Third positional argument: scopes array
    )
    
    // Store codeVerifier in a cookie for the callback route to use
    setCookie(event, `oauth_code_verifier_${provider}`, codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10 // 10 minutes
    })
    // --- END NEW CODE ---
    
  } else {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid provider'
    })
  }

  // Store state in cookie for CSRF protection
  setCookie(event, `oauth_state_${provider}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10 // 10 minutes
  })

  return sendRedirect(event, url.toString())
})