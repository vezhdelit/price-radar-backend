import { createRouter } from "@/lib/create-app";

import * as handlers from "./sandbox.handlers";
import * as routes from "./sandbox.routes";

const router = createRouter();

router.openapi(routes.test, handlers.test);
router.openapi(routes.webscrapeProduct, handlers.webscrapeProduct);

export default router;
