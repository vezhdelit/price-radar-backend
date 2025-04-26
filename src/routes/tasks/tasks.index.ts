import { createRouter } from "@/lib/create-app";
import { protect } from "@/middlewares/protect";

import * as handlers from "./tasks.handlers";
import * as routes from "./tasks.routes";

const router = createRouter();

router.use(protect);
router.openapi(routes.list, handlers.list);
router.openapi(routes.create, handlers.create);
router.openapi(routes.getOne, handlers.getOne);
router.openapi(routes.patch, handlers.patch);
router.openapi(routes.remove, handlers.remove);

export default router;
