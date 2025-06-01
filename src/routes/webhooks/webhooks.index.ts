import { createRouter } from "@/lib/create-app";

import * as handlers from "./webhooks.handlers";
import * as routes from "./webhooks.routes";

const router = createRouter();

router.openapi(routes.scrapedHtmlWebhook, handlers.scrapedHtmlWebhook);

export default router;
