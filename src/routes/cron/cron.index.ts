import { createRouter } from "@/lib/create-app";

import * as handlers from "./cron.handlers";
import * as routes from "./cron.routes";

const router = createRouter();

router.openapi(routes.checkAllProducts, handlers.checkAllProducts);

export default router;
