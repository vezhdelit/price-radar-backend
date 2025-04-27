import { z } from "zod";

import type { FuncResult } from "@/types/func";

import { CURRENCY_CHAR_TO_CODE } from "@/constants/currencies";
import db from "@/db";
import { checks, type insertCheckssSchema, type selectChecksSchema } from "@/db/schemas";
import { getStagehand } from "@/lib/stagehand";

type NewCheck = z.infer<typeof insertCheckssSchema>;
type Check = z.infer<typeof selectChecksSchema>;

export async function checkProduct(product_id: string, url: string): Promise<FuncResult<Check>> {
  const stagehand = getStagehand();
  if (!stagehand) {
    return {
      data: null,
      error: new Error("Stagehand not initialized"),
    };
  }

  try {
    await stagehand.init();
    const page = stagehand.page;
    await page.goto(url);
    const { image_url, name, price, currency } = await page.extract({
      instruction:
        "Extract the image_url, name, price and currency of the product from the page. Be sure to get discount price if product is on discount.",
      schema: z.object({
        image_url: z.string().optional().describe("The URL of the product image"),
        name: z.string().describe("The name of the product"),
        price: z.number().describe("The price of the product"),
        currency: z.string().describe("The currency of the price"),
      }),
    });

    await page.close();
    await stagehand.close();

    let currencyCode = currency;
    if (currencyCode.length !== 3) {
      const code = CURRENCY_CHAR_TO_CODE[currencyCode as keyof typeof CURRENCY_CHAR_TO_CODE];
      if (!code) {
        return {
          data: null,
          error: new Error("Currency not supported"),
        };
      }
      currencyCode = code;
    }

    const checkObj: NewCheck = {
      title: name,
      productId: product_id,
      imageUrl: image_url,
      price,
      currency: currencyCode,
    };

    const { data: check, error } = await createCheck(checkObj);
    if (error) {
      return {
        data: null,
        error,
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
