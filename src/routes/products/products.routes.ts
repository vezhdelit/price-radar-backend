import { createRoute, z } from "@hono/zod-openapi";

import { HTTP_STATUS_CODES } from "@/constants/http-status";
import { insertProductsSchema, selectChecksSchema, selectProductsSchema } from "@/db/schemas";
import { createErrorSchema, getDomainIdParamsSchema, jsonContent, jsonContentRequired, notFoundSchema } from "@/utils/api";

const tags = ["Products"];

export const list = createRoute({
  path: "/api/products",
  method: "get",
  tags,
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(
      z.array(selectProductsSchema.openapi("Product", {
        required: [],
      })),
      "The list of products",
    ),
  },
});
export type ListRoute = typeof list;

export const create = createRoute({
  path: "/api/products",
  method: "post",
  request: {
    body: jsonContentRequired(
      insertProductsSchema,
      "The product to create",
    ),
  },
  tags,
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(
      selectProductsSchema.extend({
        checkId: z.string().describe("The id of the check"),
      }),
      "The created product",
    ),
    [HTTP_STATUS_CODES.CONFLICT]: jsonContent(
      z.object({
        message: z.string().describe("The error message"),
      }),
      "Product already exists",
    ),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(insertProductsSchema),
      "The validation error(s)",
    ),
    [HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        message: z.string().describe("The error message"),
      }),
      "Error checking product url",
    ),
  },
});

export type CreateRoute = typeof create;

export const getOne = createRoute({
  path: "/api/products/{id}",
  method: "get",
  request: {
    params: getDomainIdParamsSchema("prd"),
  },
  tags,
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(
      selectProductsSchema,
      "The requested product",
    ),
    [HTTP_STATUS_CODES.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Product not found",
    ),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(getDomainIdParamsSchema("prd")),
      "Invalid id error",
    ),
  },
});

export type GetOneRoute = typeof getOne;

export const check = createRoute({
  path: "/api/products/{id}/check",
  method: "post",
  request: {
    params: getDomainIdParamsSchema("prd"),
  },
  tags,
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(
      selectProductsSchema.extend({
        checkId: z.string().describe("The id of the check"),
      }),
      "The requested product",
    ),
    [HTTP_STATUS_CODES.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Product not found",
    ),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(getDomainIdParamsSchema("prd")),
      "Invalid id error",
    ),
    [HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({
        message: z.string().describe("The error message"),
      }),
      "Error checking product url",
    ),
  },
});

export type CheckRoute = typeof check;

export const checkHistory = createRoute({
  path: "/api/products/{id}/check/history",
  method: "get",
  request: {
    params: getDomainIdParamsSchema("prd"),
  },
  tags,
  responses: {
    [HTTP_STATUS_CODES.OK]: jsonContent(
      z.array(selectChecksSchema),
      "The list of products",
    ),
    [HTTP_STATUS_CODES.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Product not found",
    ),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(getDomainIdParamsSchema("prd")),
      "Invalid id error",
    ),
  },
});
export type CheckHistoryRoute = typeof checkHistory;

// export const patch = createRoute({
//   path: "/api/tasks/{id}",
//   method: "patch",
//   request: {
//     params: getDomainIdParamsSchema("tsk"),
//     body: jsonContentRequired(
//       patchTasksSchema,
//       "The task updates",
//     ),
//   },
//   tags,
//   responses: {
//     [HTTP_STATUS_CODES.OK]: jsonContent(
//       selectTasksSchema,
//       "The updated task",
//     ),
//     [HTTP_STATUS_CODES.NOT_FOUND]: jsonContent(
//       notFoundSchema,
//       "Task not found",
//     ),
//     [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: jsonContent(
//       createErrorSchema(patchTasksSchema)
//         .or(createErrorSchema(getDomainIdParamsSchema("tsk"))),
//       "The validation error(s)",
//     ),
//   },
// });

// export type PatchRoute = typeof patch;

export const remove = createRoute({
  path: "/api/products/{id}",
  method: "delete",
  request: {
    params: getDomainIdParamsSchema("prd"),
  },
  tags,
  responses: {
    [HTTP_STATUS_CODES.NO_CONTENT]: {
      description: "Product deleted",
    },
    [HTTP_STATUS_CODES.NOT_FOUND]: jsonContent(
      notFoundSchema,
      "Product not found",
    ),
    [HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(getDomainIdParamsSchema("prd")),
      "Invalid id error",
    ),
  },
});

export type RemoveRoute = typeof remove;
