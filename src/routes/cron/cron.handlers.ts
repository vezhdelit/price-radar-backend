import { eq } from "drizzle-orm";

import type { AppRouteHandler } from "@/types/hono";

import { HTTP_STATUS_CODES } from "@/constants/http-status";
import db from "@/db";
import { products } from "@/db/schemas";
import { checkProduct } from "@/services/checker";

import type { CheckAllProductsRoute } from "./cron.routes";

export const checkAllProducts: AppRouteHandler<CheckAllProductsRoute> = async (c) => {
  const productsToCheck = await db.select({ id: products.id, url: products.url }).from(products).limit(25);

  const alteredProducts = [];
  for (const product of productsToCheck) {
    const { data: check, error } = await checkProduct(product.id, product.url);
    if (!error) {
      const [altered] = await db.update(products).set({
        title: check.title,
        imageUrl: check.imageUrl,
        price: check.price,
        currency: check.currency,
      }).where(eq(products.id, product.id)).returning({
        id: products.id,
        title: products.title,
        imageUrl: products.imageUrl,
        price: products.price,
        currency: products.currency,
      });
      alteredProducts.push(altered);
    }
    else {
      c.var.logger.error(`Error checking product ${product.id}: ${error}`);
    }
  }

  return c.json(alteredProducts, HTTP_STATUS_CODES.OK);
};
