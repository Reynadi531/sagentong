CREATE TABLE "langganan_laporan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"laporan_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "langganan_laporan_user_laporan_unique" UNIQUE("user_id","laporan_id")
);
--> statement-breakpoint
ALTER TABLE "langganan_laporan" ADD CONSTRAINT "langganan_laporan_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "langganan_laporan" ADD CONSTRAINT "langganan_laporan_laporan_id_laporan_id_fk" FOREIGN KEY ("laporan_id") REFERENCES "public"."laporan"("id") ON DELETE cascade ON UPDATE no action;