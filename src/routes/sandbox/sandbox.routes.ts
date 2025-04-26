import { createRoute } from "@hono/zod-openapi";

import { HTTP_STATUS_CODES } from "@/constants/http-status";
import { createMessageObjectSchema, jsonContent } from "@/utils/api";

const tags = ["Sandbox"];

export const test = createRoute({
  path: "/api/sandbox/test",
  method: "get",
  tags,
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(
      createMessageObjectSchema("Sandbox test route"),
      "Sandbox test route",
    ),
  },
  hide: true,
});

export type TestRoute = typeof test;
