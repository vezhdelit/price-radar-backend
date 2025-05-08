import { createRoute, z } from "@hono/zod-openapi";

import { HTTP_STATUS_CODES } from "@/constants/http-status";
import { selectProductsSchema } from "@/db/schemas";
import { jsonContent } from "@/utils/api";

const tags = ["Cron"];

export const checkAllProducts = createRoute({
  path: "/api/cron/products/checkall",
  method: "get",
  tags,
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(
      z.array(selectProductsSchema.partial()),
      "The list of checks performed",
    ),
  },
  hide: true,
});
export type CheckAllProductsRoute = typeof checkAllProducts;
