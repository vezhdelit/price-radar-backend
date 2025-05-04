import type { AppRouteHandler } from "@/types/hono";

import { HTTP_STATUS_CODES } from "@/constants/http-status";
import { scrapeProductData } from "@/services/webscraper";

import type { TestRoute, WebscrapeProductRoute } from "./sandbox.routes";

export const test: AppRouteHandler<TestRoute> = async (c) => {
  return c.json(
    {
      message: "Sandbox test route",
    },
    HTTP_STATUS_CODES.OK,
  );
};

export const webscrapeProduct: AppRouteHandler<WebscrapeProductRoute> = async (c) => {
  const { url } = c.req.valid("query");

  const { data, error } = await scrapeProductData(url);
  if (error) {
    return c.json(
      {
        message: error.message,
      },
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    );
  }
  return c.json(data, HTTP_STATUS_CODES.OK);
};
