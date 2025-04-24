import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { generateRandomDomainId } from "@/utils/id";

export const users = pgTable("users", {
  id: text("id").primaryKey().notNull().$defaultFn(() => generateRandomDomainId("usr")),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const selectUsersSchema = createSelectSchema(users);

export const insertUsersSchema = createInsertSchema(users, {
  email: s => s.email.email(),
  name: s => s.name.min(1).max(100),
}).omit({ id: true, createdAt: true });
