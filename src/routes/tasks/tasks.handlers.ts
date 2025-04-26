import { and, eq } from "drizzle-orm";

import type { AppRouteHandler } from "@/types/hono";

import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from "@/constants/http-status";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/constants/zod";
import db from "@/db";
import { tasks } from "@/db/schemas/tasks";

import type { CreateRoute, GetOneRoute, ListRoute, PatchRoute, RemoveRoute } from "./tasks.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const user = c.get("user")!;
  const list = await db.select().from(tasks).where(eq(tasks.userId, user.id));
  return c.json(list);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const user = c.get("user")!;
  const task = c.req.valid("json");
  const taskToInsert = {
    ...task,
    userId: user.id,
  };
  const [inserted] = await db.insert(tasks).values(taskToInsert).returning();
  return c.json(inserted, HTTP_STATUS_CODES.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.valid("param");
  const task = await db.query.tasks.findFirst({
    where(fields, operators) {
      return operators.eq(fields.id, id) && operators.eq(fields.userId, user.id);
    },
  });

  if (!task) {
    return c.json(
      {
        message: HTTP_STATUS_MESSAGES.NOT_FOUND,
      },
      HTTP_STATUS_CODES.NOT_FOUND,
    );
  }

  return c.json(task, HTTP_STATUS_CODES.OK);
};

export const patch: AppRouteHandler<PatchRoute> = async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.valid("param");
  const updates = c.req.valid("json");

  if (Object.keys(updates).length === 0) {
    return c.json(
      {
        success: false,
        error: {
          issues: [
            {
              code: ZOD_ERROR_CODES.INVALID_UPDATES,
              path: [],
              message: ZOD_ERROR_MESSAGES.NO_UPDATES,
            },
          ],
          name: "ZodError",
        },
      },
      HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
    );
  }

  const [updated] = await db.update(tasks)
    .set(updates)
    .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
    .returning();

  if (!updated) {
    return c.json(
      {
        message: HTTP_STATUS_MESSAGES.NOT_FOUND,
      },
      HTTP_STATUS_CODES.NOT_FOUND,
    );
  }

  return c.json(updated, HTTP_STATUS_CODES.OK);
};

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.valid("param");
  const [deleted] = await db.delete(tasks).where(
    and(
      eq(tasks.id, id),
      eq(tasks.userId, user.id),
    ),
  ).returning();

  if (!deleted) {
    return c.json(
      {
        message: HTTP_STATUS_MESSAGES.NOT_FOUND,
      },
      HTTP_STATUS_CODES.NOT_FOUND,
    );
  }

  return c.body(null, HTTP_STATUS_CODES.NO_CONTENT);
};
