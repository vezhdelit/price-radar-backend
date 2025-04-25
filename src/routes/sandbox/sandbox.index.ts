import * as HttpStatusCodes from "stoker/http-status-codes";

import { createRouter } from "@/lib/create-app";
import { generateRandomDomainId } from "@/utils/id";

const router = createRouter().get("/api/sandbox", async (c) => {
  generateRandomDomainId("test");
  return c.json(
    {
      message: "Hello, world!",
    },
    HttpStatusCodes.OK,
  );
});

export default router;
