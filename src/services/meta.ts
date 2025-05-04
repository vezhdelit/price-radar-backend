import axios from "axios";
import * as cheerio from "cheerio";

import type { FuncResult } from "@/types/func";
import type { ScrapedProductData } from "@/types/products";

import { extractPriceInCents } from "@/utils/currency";

type PartialScrapedProductData = Partial<ScrapedProductData>;

export async function parseProductMetaData(url: string): Promise<FuncResult<PartialScrapedProductData>> {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const productData = parseCheerioMetaData($);
    return { data: productData, error: null };
  }
  catch (error: any) {
    console.error("Error scraping product data:", error);
    return { data: null, error: new Error(error.message || "Failed to scrape data") };
  }
}

export function parseCheerioMetaData($: cheerio.CheerioAPI): PartialScrapedProductData {
  const productData: PartialScrapedProductData = {};

  // Extract title
  productData.title
      = $("meta[property=\"og:title\"]").attr("content")
        || $("meta[name=\"twitter:title\"]").attr("content")
        || $("title").text()
        || undefined;

  // Extract image URL
  productData.imageUrl
      = $("meta[property=\"og:image\"]").attr("content")
        || $("meta[name=\"twitter:image\"]").attr("content")
        || $("link[rel=\"image_src\"]").attr("href")
        || null;

  // Extract price
  const priceContent
      = $("meta[property=\"product:price:amount\"]").attr("content")
        || $("meta[name=\"twitter:data1\"]").attr("content") // Often used for price on Twitter cards
        || undefined;

  if (priceContent) {
    productData.price = extractPriceInCents(priceContent);
  }

  // Extract currency
  productData.currency
      = $("meta[property=\"product:price:currency\"]").attr("content")
        || $("meta[name=\"twitter:label1\"]").next("meta[name=\"twitter:data1\"]").attr("content") // Try to find currency next to a price label on Twitter
        || undefined;

  return productData;
}
