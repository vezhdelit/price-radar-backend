import { createRouter } from "@/lib/create-app";

import * as handlers from "./webhook.handlers";
import * as routes from "./webhook.routes";

const router = createRouter();

router.openapi(routes.scrapedHtmlWebhook, handlers.scrapedHtmlWebhook);

export default router;
