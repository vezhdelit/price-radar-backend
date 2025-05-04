import axios from "axios";
import * as cheerio from "cheerio";

import type { FuncResult } from "@/types/func";
import type { ScrapedProductData } from "@/types/products";

import { extractPriceInCents } from "@/utils/currency";

type PartialScrapedProductData = Partial<ScrapedProductData>;

export async function parseProductJsonLdData(url: string): Promise<FuncResult<PartialScrapedProductData>> {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const productData = parseCheerioJsonLdData($);
    return { data: productData, error: null };
  }
  catch (error: any) {
    console.error("Error scraping product data:", error);
    return { data: null, error: new Error(error.message || "Failed to scrape data") };
  }
}

export function parseCheerioJsonLdData($: cheerio.CheerioAPI): PartialScrapedProductData {
  const productData: PartialScrapedProductData = {};
  $("script[type=\"application/ld+json\"]").each((i, element) => {
    const jsonString = $(element).text();
    try {
      const jsonData = JSON.parse(jsonString);
      if (jsonData["@type"] === "Product" && !productData.title) {
        productData.imageUrl = Array.isArray(jsonData.image) ? jsonData.image[0] : jsonData.image;
        productData.title = jsonData.name;
        if (jsonData.offers && jsonData.offers["@type"] === "Offer") {
          productData.price = extractPriceInCents(jsonData.offers.price);
          productData.currency = jsonData.offers.priceCurrency;
        }
        else if (Array.isArray(jsonData.offers)) {
          const offer = jsonData.offers.find((o: any) => o["@type"] === "Offer");
          if (offer) {
            productData.price = extractPriceInCents(offer.price);
            productData.currency = offer.priceCurrency;
          }
        }
      }
    }
    catch (error) {
      console.error("Error parsing JSON-LD:", error);
    }
  });

  return productData;
}
