import { cors } from "hono/cors";

import { auth } from "@/lib/auth";
import { createRouter } from "@/lib/create-app";

const router = createRouter().use(
  "/api/auth/*", // or replace with "*" to enable cors for all routes
  cors({
    origin: "http://localhost:5173", // replace with your origin
    allowHeaders: ["Origin", "Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
).on(["POST", "GET"], "/api/auth/**", c => auth.handler(c.req.raw)).use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

export default router;
