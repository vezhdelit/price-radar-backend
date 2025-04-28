import { createRouter } from "@/lib/create-app";
import { protect } from "@/middlewares/protect";

import * as handlers from "./products.handlers";
import * as routes from "./products.routes";

const router = createRouter();

router.use(protect);

router.openapi(routes.list, handlers.list);
router.openapi(routes.create, handlers.create);
router.openapi(routes.getOne, handlers.getOne);
// router.openapi(routes.patch, handlers.patch);
router.openapi(routes.remove, handlers.remove);

router.openapi(routes.check, handlers.check);
router.openapi(routes.checkHistory, handlers.checkHistory);

export default router;
