import { createRoute, z } from "@hono/zod-openapi";

import { HTTP_STATUS_CODES } from "@/constants/http-status";
import { insertTasksSchema, patchTasksSchema, selectTasksSchema } from "@/db/schemas/tasks";
import { createErrorSchema, getDomainIdParamsSchema, jsonContent, jsonContentRequired, notFoundSchema } from "@/utils/api";

const tags = ["Tasks"];

export const list = createRoute({
  path: "/api/tasks",
  method: "get",
  tags,
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(
      z.array(selectTasksSchema.openapi("Task", {
        required: [],
      })),
      "The list of tasks",
    ),
  },
});

export const create = createRoute({
  path: "/api/tasks",
  method: "post",
  request: {
    body: jsonContentRequired(
      insertTasksSchema,
      "The task to create",
    ),
  },
  tags,
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(
      selectTasksSchema,
      "The created task",
    ),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertTasksSchema),
      "The validation error(s)",
    ),
  },
});

export const getOne = createRoute({
  path: "/api/tasks/{id}",
  method: "get",
  request: {
    params: getDomainIdParamsSchema("tsk"),
  },
  tags,
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(
      selectTasksSchema,
      "The requested task",
    ),
    [HTTP_STATUS_CODES.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Task not found",
    ),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(getDomainIdParamsSchema("tsk")),
      "Invalid id error",
    ),
  },
});

export const patch = createRoute({
  path: "/api/tasks/{id}",
  method: "patch",
  request: {
    params: getDomainIdParamsSchema("tsk"),
    body: jsonContentRequired(
      patchTasksSchema,
      "The task updates",
    ),
  },
  tags,
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(
      selectTasksSchema,
      "The updated task",
    ),
    [HTTP_STATUS_CODES.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Task not found",
    ),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(patchTasksSchema)
        .or(createErrorSchema(getDomainIdParamsSchema("tsk"))),
      "The validation error(s)",
    ),
  },
});

export const remove = createRoute({
  path: "/api/tasks/{id}",
  method: "delete",
  request: {
    params: getDomainIdParamsSchema("tsk"),
  },
  tags,
  responses: {
    [HTTP_STATUS_CODES.NO_CONTENT]: {
      description: "Task deleted",
    },
    [HTTP_STATUS_CODES.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Task not found",
    ),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(getDomainIdParamsSchema("tsk")),
      "Invalid id error",
    ),
  },
});

export type ListRoute = typeof list;
export type CreateRoute = typeof create;
export type GetOneRoute = typeof getOne;
export type PatchRoute = typeof patch;
export type RemoveRoute = typeof remove;
