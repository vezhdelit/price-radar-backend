ALTER TABLE "tasks" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "tasks" CASCADE;--> statement-breakpoint
ALTER TABLE "checks" DROP CONSTRAINT "checks_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "checks" ADD CONSTRAINT "checks_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;