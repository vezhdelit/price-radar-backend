import type { Context, Next } from "hono";

import { auth } from "@/lib/auth";

// Middleware to protect routes from unauthorized access
export async function protect(c: Context, next: Next) {
  // Extract the session from the incoming request headers
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  // If no valid session or user is found, return an unauthorized response
  if (!session || !session.user) {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
        error: "No valid session found",
      },
      401,
    );
  }

  // Optionally set the user and session on the context variables
  c.set("user", session.user);
  c.set("session", session.session);

  // Continue to the next middleware/handler
  await next();
}
