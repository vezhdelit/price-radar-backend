import axios from "axios";
import * as cheerio from "cheerio";

import type { FuncResult } from "@/types/func";
import type { ScrapedProductData } from "@/types/products";

function extractPriceInCents(priceStr: string | number | undefined): number | undefined {
  if (typeof priceStr === "string") {
    const numericPrice = Number.parseFloat(priceStr.replace(/[^0-9.]/g, ""));
    return Number.isNaN(numericPrice) ? undefined : Math.round(numericPrice * 100);
  }
  else if (typeof priceStr === "number") {
    return Math.round(priceStr * 100);
  }
  return undefined;
}

export async function getProductJsonLd(url: string): Promise<FuncResult<ScrapedProductData>> {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const productData: any = {};
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

    if (!productData.title || !productData.price || !productData.currency) {
      return { data: null, error: new Error("Product data not found") };
    }

    const resultData: ScrapedProductData = {
      imageUrl: productData.imageUrl || null,
      title: productData.title,
      price: productData.price,
      currency: productData.currency,
    };

    return { data: resultData, error: null };
  }
  catch (error: any) {
    console.error("Error scraping product data:", error);
    return { data: null, error: new Error(error.message || "Failed to scrape data") };
  }
}
