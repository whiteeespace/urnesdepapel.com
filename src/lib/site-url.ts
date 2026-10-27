const fromVercel = (host: string | undefined) => (host ? `https://${host}` : undefined);

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_ENV === "production"
    ? fromVercel(process.env.VERCEL_PROJECT_PRODUCTION_URL)
    : fromVercel(process.env.VERCEL_URL)) ??
  "http://localhost:3000";
