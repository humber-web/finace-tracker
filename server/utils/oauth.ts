import { Google } from 'arctic'
// import { GitHub } from 'arctic'  // Commented out - GitHub login disabled
import { users, oauthAccounts } from '../database/schema'
import { eq, and } from 'drizzle-orm'
import { db } from './db'

const config = useRuntimeConfig()

// Debug: Log what we're getting from config
console.log('[OAuth] Config loaded:', {
  googleClientId: config.googleClientId ? `${config.googleClientId.substring(0, 20)}...` : 'NOT SET',
  googleClientSecret: config.googleClientSecret ? 'SET' : 'NOT SET',
  // githubClientId: config.githubClientId ? `${config.githubClientId.substring(0, 20)}...` : 'NOT SET',
  // githubClientSecret: config.githubClientSecret ? 'SET' : 'NOT SET',
  appUrl: config.public.appUrl
})

// Initialize OAuth clients
let googleOAuth: Google | null = null
// let githubOAuth: GitHub | null = null  // Commented out - GitHub login disabled

// Only initialize if credentials are provided
if (config.googleClientId && config.googleClientSecret) {
 
  googleOAuth = new Google(
    config.googleClientId,
    config.googleClientSecret,
    `${config.public.appUrl}/api/auth/callback/google`
  )
} else {
  console.warn('[OAuth] Google OAuth not initialized - missing credentials')
}

// GitHub OAuth disabled for now - uncomment to re-enable
// if (config.githubClientId && config.githubClientSecret) {
//   console.log('[OAuth] Initializing GitHub OAuth client')
//   githubOAuth = new GitHub(
//     config.githubClientId,
//     config.githubClientSecret,
//     `${config.public.appUrl}/api/auth/callback/github`
//   )
// } else {
//   console.warn('[OAuth] GitHub OAuth not initialized - missing credentials')
// }

export { googleOAuth }
// export { googleOAuth, githubOAuth }  // Commented out - GitHub login disabled

export interface OAuthUser {
  provider: string
  providerAccountId: string
  email: string
  name?: string
  avatar?: string
}

/**
 * Find or create user from OAuth account
 */
export async function findOrCreateOAuthUser(oauthUser: OAuthUser) {
  // Check if OAuth account exists
  const [existingAccount] = await db
    .select()
    .from(oauthAccounts)
    .where(
      and(
        eq(oauthAccounts.provider, oauthUser.provider),
        eq(oauthAccounts.providerAccountId, oauthUser.providerAccountId)
      )
    )
    .limit(1)

  if (existingAccount) {
    // Return existing user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, existingAccount.userId))
      .limit(1)

    // Update last login
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id))

    return user
  }

  // Check if user exists by email
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, oauthUser.email))
    .limit(1)

  let user = existingUser

  if (!user) {
    // Create new user
    const [newUser] = await db.insert(users).values({
      email: oauthUser.email,
      name: oauthUser.name || null,
      avatar: oauthUser.avatar || null,
      emailVerified: true, // OAuth means email is verified
      isAdmin: false,
      createdAt: new Date(),
      lastLoginAt: new Date()
    }).returning()

    user = newUser
  }

  // Link OAuth account to user
  await db.insert(oauthAccounts).values({
    userId: user.id,
    provider: oauthUser.provider,
    providerAccountId: oauthUser.providerAccountId,
    createdAt: new Date()
  })

  return user
}
