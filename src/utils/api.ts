import { z } from "zod";

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
