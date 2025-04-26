import type { ZodSchema } from "zod";

import { z } from "zod";

import { HTTP_STATUS_MESSAGES } from "@/constants/http-status";

export type UnionZodSchema = z.ZodUnion<[z.ZodTypeAny, z.ZodTypeAny]> | z.AnyZodObject | z.ZodArray<z.AnyZodObject>;
export function jsonContent<
  T extends ZodSchema,
>(schema: T, description: string) {
  return {
    content: {
      "application/json": {
        schema,
      },
    },
    description,
  };
}

export function jsonContentRequired<
  T extends ZodSchema,
>(schema: T, description: string) {
  return {
    ...jsonContent(schema, description),
    required: true,
  };
}

export function createErrorSchema<
  T extends UnionZodSchema,
>(schema: T) {
  const { error } = schema.safeParse(
    schema._def.typeName
    === z.ZodFirstPartyTypeKind.ZodArray
      ? []
      : {},
  );
  return z.object({
    success: z.boolean().openapi({
      example: false,
    }),
    error: z
      .object({
        issues: z.array(
          z.object({
            code: z.string(),
            path: z.array(
              z.union([z.string(), z.number()]),
            ),
            message: z.string().optional(),
          }),
        ),
        name: z.string(),
      })
      .openapi({
        example: error,
      }),
  });
}

export function createMessageObjectSchema(exampleMessage: string = "Hello World") {
  return z.object({
    message: z.string(),
  }).openapi({
    example: {
      message: exampleMessage,
    },
  });
}
export const IdParamsSchema = z.object({
  id: z.coerce.number().openapi({
    param: {
      name: "id",
      in: "path",
    },
    required: ["id"],
    example: 42,
  }),
});

export const DomainIdParamsSchema = z.object({
  id: z.string().openapi({
    param: {
      name: "id",
      in: "path",
    },
    required: ["id"],
    example: "id_1234567890abcdef",
  }),
});

export function getDomainIdParamsSchema(domain: string) {
  return z.object({
    id: z.string().openapi({
      param: {
        name: "id",
        in: "path",
      },
      required: ["id"],
      example: `${domain}_1234567890abcdef`,
    }),
  });
}

export const notFoundSchema = createMessageObjectSchema(HTTP_STATUS_MESSAGES.NOT_FOUND);
