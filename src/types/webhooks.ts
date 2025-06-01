import { z } from "zod";

export const scrapedHtmlSchema = z.object({
  source_url: z.string().describe("The URL of the source page where the HTML was scraped from"),
  scraped_html: z.string().describe("The HTML content that was scraped from the source URL"),
});
