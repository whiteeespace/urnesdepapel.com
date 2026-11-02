import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "home_page_values" CASCADE;
  DROP TABLE "home_page_values_locales" CASCADE;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "home_page_values" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "home_page_values_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "home_page_values" ADD CONSTRAINT "home_page_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_values_locales" ADD CONSTRAINT "home_page_values_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page_values"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_page_values_order_idx" ON "home_page_values" USING btree ("_order");
  CREATE INDEX "home_page_values_parent_id_idx" ON "home_page_values" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "home_page_values_locales_locale_parent_id_unique" ON "home_page_values_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_page_values_locales_parent_id_idx" ON "home_page_values_locales" USING btree ("_parent_id");`)
}
