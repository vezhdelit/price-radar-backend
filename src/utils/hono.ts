import type { Hook } from "@hono/zod-openapi";
import type { ErrorHandler, MiddlewareHandler, NotFoundHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from "@/constants/http-status";

export function serveEmojiFavicon(emoji: string): MiddlewareHandler {
  return async (c, next) => {
    if (c.req.path === "/favicon.ico") {
      c.header("Content-Type", "image/svg+xml");
      return c.body(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" x="-0.1em" font-size="90">${emoji}</text></svg>`);
    }
    return next();
  };
}

export const notFound: NotFoundHandler = (c) => {
  return c.json({
    message: `${HTTP_STATUS_MESSAGES.NOT_FOUND} - ${c.req.path}`,
  }, HTTP_STATUS_CODES.NOT_FOUND);
};

export const onError: ErrorHandler = (err, c) => {
  const currentStatus = "status" in err
    ? err.status
    : c.newResponse(null).status;
  const statusCode = currentStatus !== HTTP_STATUS_CODES.OK
    ? (currentStatus as ContentfulStatusCode)
    : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR;

  const env = c.env?.NODE_ENV || "development";
  return c.json(
    {
      message: err.message,

      stack: env === "production"
        ? undefined
        : err.stack,
    },
    statusCode,
  );
};

export const defaultHook: Hook<any, any, any, any> = (result, c) => {
  if (!result.success) {
    return c.json(
      {
        success: result.success,
        error: result.error,
      },
      HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
    );
  }
};
