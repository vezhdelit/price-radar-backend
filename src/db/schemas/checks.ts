import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { generateRandomDomainId } from "@/utils/id";

import { products } from "./products";

export const checks = pgTable("checks", {
  id: text("id").primaryKey().notNull().$defaultFn(() => generateRandomDomainId("chk")),
  productId: text("product_id").notNull().references(() => products.id),
  price: integer("price").notNull(),
  currency: text("currency").notNull(),
  retailer: text("retailer").notNull(),
  imageUrl: text("image_url"),
  checkedAt: timestamp("checked_at").notNull().defaultNow(),
});

export const checksRelations = relations(checks, ({ one }) => ({
  product: one(products, {
    fields: [checks.productId],
    references: [products.id],
  }),
}));

export const selectChecksSchema = createSelectSchema(checks);
export const insertCheckssSchema = createInsertSchema(checks).omit({
  id: true,
  checkedAt: true,
});
