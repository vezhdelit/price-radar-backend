ALTER TABLE "checks" ALTER COLUMN "retailer" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "checks" ADD COLUMN "title" text NOT NULL;