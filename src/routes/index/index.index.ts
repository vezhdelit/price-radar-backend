import { Hono } from "hono";
import * as HttpStatusCodes from "stoker/http-status-codes";

const router = new Hono().get("/", async (c) => {
  return c.json(
    {
      message: "Hello, world!",
    },
    HttpStatusCodes.OK,
  );
});

export default router;
