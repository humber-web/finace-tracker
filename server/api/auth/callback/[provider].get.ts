import { googleOAuth, findOrCreateOAuthUser } from "../../../utils/oauth";
import { generateTokens } from "../../../utils/jwt";

export default defineEventHandler(async (event) => {
  const provider = getRouterParam(event, "provider");
  const query = getQuery(event);

  // Verify state (CSRF protection)
  const storedState = getCookie(event, `oauth_state_${provider}`);
  if (!storedState || storedState !== query.state) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid state parameter",
    });
  }

  // Delete state cookie
  deleteCookie(event, `oauth_state_${provider}`);

  try {
    let oauthUser;

    if (provider === "google") {
      // Get code verifier from cookie
      const codeVerifier = getCookie(event, `oauth_code_verifier_google`);
      if (!codeVerifier) {
        throw createError({
          statusCode: 400,
          statusMessage: "Missing code verifier for Google OAuth",
        });
      }
      deleteCookie(event, `oauth_code_verifier_google`); // Delete it immediately

      // Validate with the code verifier
      if (!googleOAuth) {
        throw createError({
          statusCode: 500,
          statusMessage: "Google OAuth configuration is missing",
        });
      }
      const tokens = await googleOAuth.validateAuthorizationCode(
        query.code as string,
        codeVerifier
      );
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${tokens.accessToken()}` },
        }
      );
      const data = await response.json();

      oauthUser = {
        provider: "google",
        providerAccountId: data.id,
        email: data.email,
        name: data.name,
        avatar: data.picture,
      };
    } else {
      throw createError({ statusCode: 400, statusMessage: "Invalid provider" });
    }

    // Find or create user
    const user = await findOrCreateOAuthUser(oauthUser);

    // Generate JWT tokens
    const { accessToken, refreshToken } = await generateTokens(
      user.id,
      user.email,
      user.isAdmin ? true : false
    );

    // Set tokens in HTTP-only cookies
    setCookie(event, "auth_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    setCookie(event, "refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Redirect to dashboard
    return sendRedirect(event, "/dashboard");
  } catch (error) {
    console.error("OAuth callback error:", error);
    return sendRedirect(event, "/login?error=oauth_failed");
  }
});
