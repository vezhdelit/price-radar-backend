import { createRoute, z } from "@hono/zod-openapi";

import { HTTP_STATUS_CODES } from "@/constants/http-status";
import env from "@/env";
import { scrapedHtmlSchema } from "@/types/webhooks";
import { createMessageObjectSchema, jsonContent, jsonContentRequired } from "@/utils/api";

const tags = ["Webhooks"];

export const scrapedHtmlWebhook = createRoute({
  path: "/api/webhook/scraped-html",
  method: "post",
  request: {
    body: jsonContentRequired(
      scrapedHtmlSchema,
      "The product to create",
    ),
  },
  tags,
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(
      createMessageObjectSchema("Webhook received successfully"),
      "WebhookResponse",
    ),
  },
  hide: env.NODE_ENV !== "development",
});

export type ScrapedHtmlWebhookRoute = typeof scrapedHtmlWebhook;
