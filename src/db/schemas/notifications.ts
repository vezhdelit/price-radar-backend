import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { generateRandomDomainId } from "@/utils/id";

import { products } from "./products";
import { users } from "./users";

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().notNull().$defaultFn(() => generateRandomDomainId("ntf")),
  userId: text("user_id").notNull().references(() => users.id),
  productId: text("product_id").notNull().references(() => products.id),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  priceAtNotification: integer("price_at_notification").notNull(),
  type: text("type").notNull(), // e.g. "price_drop", "product_back_in_stock", "product_almost_out_of_stock"
});

export const selectNotificationsSchema = createSelectSchema(notifications);
export const insertNotificationsSchema = createInsertSchema(notifications).omit({
  id: true,
  sentAt: true,
});
