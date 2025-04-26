import { createRoute } from "@hono/zod-openapi";

import { HTTP_STATUS_CODES } from "@/constants/http-status";
import { createRouter } from "@/lib/create-app";
import { createMessageObjectSchema, jsonContent } from "@/utils/api";

const router = createRouter()
  .openapi(
    createRoute({
      tags: ["Index"],
      method: "get",
      path: "/",
      responses: {
        [HTTP_STATUS_CODES.OK]: jsonContent(
          createMessageObjectSchema("Tasks API"),
          "Tasks API Index",
        ),
      },
      hide: true,
    }),
    (c) => {
      return c.json({
        message: "Tasks API",
      }, HTTP_STATUS_CODES.OK);
    },
  );

export default router;
