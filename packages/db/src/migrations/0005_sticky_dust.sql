CREATE TABLE "bantuan_relawan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"laporan_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"jenis_bantuan" text NOT NULL,
	"keterangan" text NOT NULL,
	"evidence_image" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bantuan_relawan" ADD CONSTRAINT "bantuan_relawan_laporan_id_laporan_id_fk" FOREIGN KEY ("laporan_id") REFERENCES "public"."laporan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bantuan_relawan" ADD CONSTRAINT "bantuan_relawan_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;