const fromVercel = (host: string | undefined) => (host ? `https://${host}` : undefined);

// Accepts the address with or without its scheme ("urnesdepapel.com" or "https://urnesdepapel.com/")
// and returns it as a full origin with no trailing slash, so a slip in the environment variable can't
// break the build.
const normalize = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`).replace(/\/+$/, "");

export const siteUrl = normalize(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_ENV === "production"
      ? fromVercel(process.env.VERCEL_PROJECT_PRODUCTION_URL)
      : fromVercel(process.env.VERCEL_URL)) ||
    "http://localhost:3000"
);
