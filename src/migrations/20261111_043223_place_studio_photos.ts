import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

import { placePhotos } from '../seed/media'

/**
 * Content only, no schema change: puts the client's studio photos on the artisan and about pages
 * where they are still empty (see placePhotos), so they reach production with the deploy. Text and
 * photos already chosen in the admin are left alone.
 *
 * The writes don't join the migration's transaction: placePhotos is safe to re-run, so if this
 * migration fails partway, the next deploy simply finishes the job.
 */
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // Without the token on Vercel, uploads would go to the build machine's disk and be lost.
  if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is missing, so the photos cannot be uploaded to Vercel Blob.')
  }
  await placePhotos(payload)
}

// The photos stay: they are content the client may have kept or replaced since.
export async function down(_args: MigrateDownArgs): Promise<void> {}
