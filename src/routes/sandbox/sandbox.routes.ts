import { createRoute, z } from "@hono/zod-openapi";

import { HTTP_STATUS_CODES } from "@/constants/http-status";
import env from "@/env";
import { scrapedProductSchema } from "@/types/products";
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
  hide: env.NODE_ENV !== "development",
});

export type TestRoute = typeof test;

export const webscrapeProduct = createRoute({
  path: "/api/sandbox/product/webscrape",
  method: "get",
  tags,
  request: {
    query: z.object({
      url: z.string().describe("The URL of the product to scrape").openapi({
        example: "https://jabko.ua/rus/product/gejmpad-playstation-5-dualsense",
      }),
    }),
  },
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(
      scrapedProductSchema,
      "Sandbox test route",
    ),
    [HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        message: z.string().describe("The error message"),
      }),
      "Error scraping product data",
    ),
  },
  hide: env.NODE_ENV !== "development",
});
export type WebscrapeProductRoute = typeof webscrapeProduct;

export const parseProductJsonLd = createRoute({
  path: "/api/sandbox/product/jsonld",
  method: "get",
  tags,
  request: {
    query: z.object({
      url: z.string().describe("The URL of the product to get json-ld").openapi({
        example: "https://jabko.ua/rus/product/gejmpad-playstation-5-dualsense",
      }),
    }),
  },
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(
      scrapedProductSchema.partial(),
      "Sandbox test route",
    ),
    [HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        message: z.string().describe("The error message"),
      }),
      "Error scraping product data",
    ),
  },
  hide: env.NODE_ENV !== "development",
});
export type ParseProductJsonLdRoute = typeof parseProductJsonLd;

export const parseProductScripts = createRoute({
  path: "/api/sandbox/product/scripts",
  method: "get",
  tags,
  request: {
    query: z.object({
      url: z.string().describe("The URL of the product to get data from its scripts").openapi({
        example: "https://jabko.ua/rus/product/gejmpad-playstation-5-dualsense",
      }),
    }),
  },
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(
      scrapedProductSchema.partial(),
      "Sandbox test route",
    ),
    [HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        message: z.string().describe("The error message"),
      }),
      "Error scraping product data",
    ),
  },
  hide: env.NODE_ENV !== "development",
});
export type ParseProductScriptsRoute = typeof parseProductScripts;

export const parseProductMeta = createRoute({
  path: "/api/sandbox/product/meta",
  method: "get",
  tags,
  request: {
    query: z.object({
      url: z.string().describe("The URL of the product to get data from its meta tags").openapi({
        example: "https://jabko.ua/rus/product/gejmpad-playstation-5-dualsense",
      }),
    }),
  },
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(
      scrapedProductSchema.partial(),
      "Sandbox test route",
    ),
    [HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        message: z.string().describe("The error message"),
      }),
      "Error scraping product data",
    ),
  },
  hide: env.NODE_ENV !== "development",
});
export type ParseProductMetaRoute = typeof parseProductMeta;
