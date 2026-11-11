/**
 * Puts the client's photos on the pages without touching any text (see placePhotos), for a site
 * whose copy has already been edited in the admin. Run with `npm run seed:photos`.
 */
import { getPayload } from "payload";

import config from "@payload-config";

import { placePhotos } from "./media";

const payload = await getPayload({ config });
await placePhotos(payload);
payload.logger.info("Photos placed.");
process.exit(0);
