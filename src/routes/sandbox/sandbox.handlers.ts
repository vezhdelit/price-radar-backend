import type { AppRouteHandler } from "@/types/hono";

import { HTTP_STATUS_CODES } from "@/constants/http-status";

import type { TestRoute } from "./sandbox.routes";

export const test: AppRouteHandler<TestRoute> = async (c) => {
  return c.json(
    {
      message: "Sandbox test route",
    },
    HTTP_STATUS_CODES.OK,
  );
};
