import axios from "axios";
import * as cheerio from "cheerio";

import type { FuncResult } from "@/types/func";
import type { PartialScrapedProductData } from "@/types/products";

import { extractPriceInCents } from "@/utils/currency";

export async function parseScriptData(url: string): Promise<FuncResult<PartialScrapedProductData>> {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const productData = parseCheerioScriptData($);
    return { data: productData, error: null };
  }
  catch (error) {
    console.error("Error fetching product page:", error);
    return { data: null, error: new Error("Failed to fetch product page") };
  }
}

export function parseCheerioScriptData($: cheerio.CheerioAPI): PartialScrapedProductData {
  const productData: PartialScrapedProductData = {};
  $("script:not([type])").each((i, element) => {
    const scriptContent = $(element).text();

    // Parse dataLayer pushes with currencyCode at the top level of ecommerce
    const dataLayerMatch = scriptContent.match(/dataLayer\.push\(\s*\{[\s\S]*?'ecommerce':\s*\{[\s\S]*?'currencyCode':\s*'([A-Z]{3})'[\s\S]*?(?:'detail':\s*\{[\s\S]*?'products':\s*\[\{[\s\S]*?'name':\s*'([^']*)'[\s\S]*?'price':\s*'([^']*)'[\s\S]*?\}\]|'items':\s*\[\{[\s\S]*?'item_name':\s*'([^']*)'[\s\S]*?'price':\s*'([^']*)'[\s\S]*?'currency':\s*'([A-Z]{3})'[\s\S]*?\}\])[\s\S]*?\}\s*\}\s*\)/);

    if (dataLayerMatch) {
      try {
        const currencyCode = dataLayerMatch[1];
        const nameFromProducts = dataLayerMatch[2];
        const priceFromProducts = dataLayerMatch[3];
        const nameFromItems = dataLayerMatch[4];
        const priceFromItems = dataLayerMatch[5];
        const currencyFromItems = dataLayerMatch[6];

        productData.currency = currencyCode || currencyFromItems;
        productData.title = nameFromProducts || nameFromItems;
        productData.price = extractPriceInCents(priceFromProducts || priceFromItems);
      }
      catch (e) {
        console.error("Error parsing targeted dataLayer:", e);
      }
    }
    else {
      // Fallback to less specific dataLayer or gtag parsing if the targeted one isn't found
      const genericDataLayerMatch = scriptContent.match(/dataLayer\.push\(\s*\{[\s\S]*?'ecommerce'[\s\S]*?(?:'products'|'items')[\s\S]*?\}\s*\)/);
      if (genericDataLayerMatch) {
        try {
          const dataLayerJsonStr = genericDataLayerMatch[0].substring(genericDataLayerMatch[0].indexOf("{"));
          const dataLayerData = JSON.parse(dataLayerJsonStr);
          if (dataLayerData?.ecommerce?.detail?.products?.[0]) {
            const product = dataLayerData.ecommerce.detail.products[0];
            productData.title = product.name;
            productData.price = extractPriceInCents(product.price);
            productData.currency = dataLayerData.ecommerce?.currencyCode;
          }
          else if (dataLayerData?.ecommerce?.items?.[0]) {
            const item = dataLayerData.ecommerce.items[0];
            productData.title = item.item_name;
            productData.price = extractPriceInCents(item.price);
            productData.currency = item.currency;
          }
        }
        catch (e) {
          console.error("Error parsing generic dataLayer:", e);
        }
      }

      // Parse gtag event calls as a final fallback
      const gtagPriceMatch = scriptContent.match(/gtag\(\s*'event',\s*'view_item'[\s\S]*?'items':\s*\[\{[\s\S]*?'price':\s*('[^']*'|\d+(\.\d+)?)/);
      if (gtagPriceMatch && gtagPriceMatch[1] && !productData.price) {
        productData.price = extractPriceInCents(gtagPriceMatch[1].replace(/'/g, ""));
      }
      const gtagCurrencyMatch = scriptContent.match(/'currency':\s*('[A-Z]{3}')/);
      if (gtagCurrencyMatch && gtagCurrencyMatch[1] && !productData.currency) {
        productData.currency = gtagCurrencyMatch[1].replace(/'/g, "");
      }
      const gtagItemNameMatch = scriptContent.match(/'name':\s*('[^']*')/);
      if (gtagItemNameMatch && gtagItemNameMatch[1] && !productData.title) {
        productData.title = gtagItemNameMatch[1].replace(/'/g, "");
      }
    }
  });
  return productData;
}
