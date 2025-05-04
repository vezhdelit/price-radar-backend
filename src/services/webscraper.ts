import { z } from "zod";

import type { FuncResult } from "@/types/func";
import type { ScrapedProductData } from "@/types/products";

import { getStagehand } from "@/lib/stagehand";

export async function scrapeProductData(url: string): Promise<FuncResult<ScrapedProductData>> {
  const stagehand = getStagehand();
  if (!stagehand) {
    const error = new Error("Stagehand not initialized");
    console.error(error);
    return { data: null, error };
  }

  try {
    await stagehand.init();
    const page = stagehand.page;
    await page.goto(url);

    const extractedData = await page.extract({
      instruction:
                "Extract the image_url, name, price(in cents), and currency_code(in ISO 4217 currency code) of the product from the page. Be sure to get discount price if product is on discount.",
      schema: z.object({
        image_url: z.string().optional().nullable().nullable().describe("The URL of the product image. If not valid url found, return null"),
        name: z.string().describe("The name of the product"),
        price: z.number().describe("The price of the product in cents"),
        currency_code: z.string().describe("The currency of the price in ISO 4217 currency code"),
      }),
    });

    await page.close();
    await stagehand.close();

    const intPrice = Math.round(extractedData.price);

    const resultData: ScrapedProductData = {
      imageUrl: extractedData.image_url,
      title: extractedData.name,
      price: intPrice,
      currency: extractedData.currency_code,
    };

    return { data: resultData, error: null };
  }
  catch (error: any) {
    console.error("Error scraping product data:", error);
    return { data: null, error: new Error(error.message || "Failed to scrape data") };
  }
}
