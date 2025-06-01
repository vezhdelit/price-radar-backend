import type { AppRouteHandler } from "@/types/hono";

import { HTTP_STATUS_CODES } from "@/constants/http-status";

import type { ScrapedHtmlWebhookRoute } from "./webhook.routes";

export const scrapedHtmlWebhook: AppRouteHandler<ScrapedHtmlWebhookRoute> = async (c) => {
  // Extract the request body
  const body = c.req.valid("json");
  c.var.logger.info("Received webhook data:", body);

  return c.json(
    {
      message: "Webhook received successfully",
    },
    HTTP_STATUS_CODES.OK,
  );
};
