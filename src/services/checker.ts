// functions.ts
import type { z } from "zod";

import type { FuncResult } from "@/types/func";

import db from "@/db";
import { checks, type insertCheckssSchema, type selectChecksSchema } from "@/db/schemas";

import { scrapeProductData } from "./webscraper";

type NewCheck = z.infer<typeof insertCheckssSchema>;
type Check = z.infer<typeof selectChecksSchema>;

export async function checkProduct(product_id: string, url: string): Promise<FuncResult<Check>> {
  try {
    const { data: scrapedData, error: scrapeError } = await scrapeProductData(url);
    if (scrapeError) {
      return {
        data: null,
        error: scrapeError,
      };
    }

    const { data: check, error: checkCreationError } = await createCheck({
      title: scrapedData.title,
      productId: product_id,
      imageUrl: scrapedData.imageUrl,
      price: scrapedData.price,
      currency: scrapedData.currency,
    });
    if (checkCreationError) {
      return {
        data: null,
        error: checkCreationError,
      };
    }

    return {
      data: check,
      error: null,
    };
  }
  catch (error) {
    console.error("Error checking product:", error);
    return {
      data: null,
      error: new Error("Error checking product"),
    };
  }
}

export async function createCheck(check: NewCheck): Promise<FuncResult<Check>> {
  const [inserted] = await db.insert(checks).values(check).returning();
  if (!inserted) {
    return {
      data: null,
      error: new Error("Error creating check"),
    };
  }
  return {
    data: inserted,
    error: null,
  };
}
