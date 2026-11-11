import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "artisan_page_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  ALTER TABLE "about_page_sections" ADD COLUMN "image_id" integer;
  ALTER TABLE "artisan_page_rels" ADD CONSTRAINT "artisan_page_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."artisan_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artisan_page_rels" ADD CONSTRAINT "artisan_page_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "artisan_page_rels_order_idx" ON "artisan_page_rels" USING btree ("order");
  CREATE INDEX "artisan_page_rels_parent_idx" ON "artisan_page_rels" USING btree ("parent_id");
  CREATE INDEX "artisan_page_rels_path_idx" ON "artisan_page_rels" USING btree ("path");
  CREATE INDEX "artisan_page_rels_media_id_idx" ON "artisan_page_rels" USING btree ("media_id");
  ALTER TABLE "about_page_sections" ADD CONSTRAINT "about_page_sections_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "about_page_sections_image_idx" ON "about_page_sections" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "artisan_page_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "artisan_page_rels" CASCADE;
  ALTER TABLE "about_page_sections" DROP CONSTRAINT "about_page_sections_image_id_media_id_fk";
  
  DROP INDEX "about_page_sections_image_idx";
  ALTER TABLE "about_page_sections" DROP COLUMN "image_id";`)
}
