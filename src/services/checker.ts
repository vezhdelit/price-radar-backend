// functions.ts
import type { z } from "zod";

import axios from "axios";
import * as cheerio from "cheerio";

import type { FuncResult } from "@/types/func";
import type { PartialScrapedProductData } from "@/types/products";

import db from "@/db";
import { checks, type insertCheckssSchema, type selectChecksSchema } from "@/db/schemas";

import { parseCheerioJsonLdData } from "./jsonld";
import { parseCheerioMetaData } from "./meta";
import { parseCheerioScriptData } from "./scripts-parser";
import { scrapeProductData } from "./webscraper";

type NewCheck = z.infer<typeof insertCheckssSchema>;
type Check = z.infer<typeof selectChecksSchema>;

export async function checkProduct(product_id: string, url: string): Promise<FuncResult<Check>> {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const scriptData = parseCheerioScriptData($);
    const jsonLdData = parseCheerioJsonLdData($);
    const metaData = parseCheerioMetaData($);

    const productData: PartialScrapedProductData = {
      imageUrl: scriptData.imageUrl || jsonLdData.imageUrl || metaData.imageUrl,
      title: scriptData.title || jsonLdData.title || metaData.title,
      price: scriptData.price || jsonLdData.price || metaData.price,
      currency: scriptData.currency || jsonLdData.currency || metaData.currency,
    };

    if (!productData.title || !productData.price || !productData.currency) {
      const { data: scrapedData, error: scrapeError } = await scrapeProductData(url);
      if (scrapeError) {
        return {
          data: null,
          error: scrapeError,
        };
      }
      productData.imageUrl = productData.imageUrl || scrapedData.imageUrl;
      productData.title = productData.title || scrapedData.title;
      productData.price = productData.price || scrapedData.price;
      productData.currency = productData.currency || scrapedData.currency;
    }

    if (!productData.title || !productData.price || !productData.currency) {
      return {
        data: null,
        error: new Error("Product data is incomplete"),
      };
    }

    const { data: check, error: checkCreationError } = await createCheck({
      title: productData.title,
      productId: product_id,
      imageUrl: productData.imageUrl,
      price: productData.price,
      currency: productData.currency,
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
