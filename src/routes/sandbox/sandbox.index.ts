import { Hono } from "hono";
import * as HttpStatusCodes from "stoker/http-status-codes";

import { generateRandomDomainId } from "@/utils/id";

const router = new Hono().get("/api/sandbox", async (c) => {
  generateRandomDomainId("test");
  return c.json(
    {
      message: "Hello, world!",
    },
    HttpStatusCodes.OK,
  );
});

export default router;
