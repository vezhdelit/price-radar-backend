import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { generateRandomDomainId } from "@/utils/id";

import { users } from "./users";

export const products = pgTable("products", {
  id: text("id").primaryKey().notNull().$defaultFn(() => generateRandomDomainId("prd")),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  retailer: text("retailer").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const productRelations = relations(products, ({ one }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
}));

export const selectProductsSchema = createSelectSchema(products);

export const insertProductsSchema = createInsertSchema(
  products,
  {
    title: schema => schema.min(1).max(100),
    url: schema => schema.min(1).max(500),
    description: schema => schema.max(5000),
    price: schema => schema.min(0),
    currency: schema => schema.length(3),
  },
).required({
  url: true,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
