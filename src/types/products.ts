import { z } from "zod";

export const scrapedProductSchema = z.object({
  imageUrl: z.string().optional().nullable().describe("The URL of the product image. If not valid url found, return null"),
  title: z.string().describe("The name of the product"),
  price: z.number().describe("The price of the product in cents"),
  currency: z.string().describe("The currency of the price"),
});

export interface ScrapedProductData {
  imageUrl?: string | null;
  title: string;
  price: number;
  currency: string;
}
