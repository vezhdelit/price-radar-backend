import { and, eq } from "drizzle-orm";

import type { AppRouteHandler } from "@/types/hono";

import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from "@/constants/http-status";
// import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/constants/zod";
import db from "@/db";
import { checks, products } from "@/db/schemas";
import { checkProduct } from "@/services/checker";

import type { CheckHistoryRoute, CheckRoute, CreateRoute, GetOneRoute, ListRoute, /* PatchRoute, */ RemoveRoute } from "./products.routes";

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const user = c.get("user")!;
  const list = await db.select().from(products).where(eq(products.userId, user.id));
  return c.json(list);
};

export const create: AppRouteHandler<CreateRoute> = async (c) => {
  const user = c.get("user")!;
  const product = c.req.valid("json");
  const productToInsert = {
    ...product,
    userId: user.id,
  };
  const [inserted] = await db.insert(products).values(productToInsert).returning();

  const { data: check, error } = await checkProduct(inserted.id, inserted.url);
  if (error) {
    // delete the product if check fails
    await db.delete(products).where(eq(products.id, inserted.id));

    return c.json(
      {
        message: "Error checking product url",
      },
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    );
  }

  const [altered] = await db.update(products).set({
    title: check.title,
    imageUrl: check.imageUrl,
    price: check.price,
    currency: check.currency,
  }).where(eq(products.id, inserted.id)).returning();

  return c.json({
    ...altered,
    checkId: check.id,
  }, HTTP_STATUS_CODES.OK);
};

export const getOne: AppRouteHandler<GetOneRoute> = async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.valid("param");

  const [selected] = await db.select().from(products).where(
    and(
      eq(products.id, id),
      eq(products.userId, user.id),
    ),
  ).limit(1);

  if (!selected) {
    return c.json(
      {
        message: HTTP_STATUS_MESSAGES.NOT_FOUND,
      },
      HTTP_STATUS_CODES.NOT_FOUND,
    );
  }

  return c.json(selected, HTTP_STATUS_CODES.OK);
};

export const check: AppRouteHandler<CheckRoute> = async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.valid("param");
  c.var.logger.error(`Checking product: ${id}`);
  const [selected] = await db.select().from(products).where(
    and(
      eq(products.id, id),
      eq(products.userId, user.id),
    ),
  ).limit(1);

  c.var.logger.error(`Product: ${JSON.stringify(selected)}`);

  if (!selected) {
    return c.json(
      {
        message: HTTP_STATUS_MESSAGES.NOT_FOUND,
      },
      HTTP_STATUS_CODES.NOT_FOUND,
    );
  }

  const { data: check, error } = await checkProduct(selected.id, selected.url);
  if (error) {
    return c.json(
      {
        message: "Error checking product url",
      },
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    );
  }

  const [altered] = await db.update(products).set({
    title: check.title,
    imageUrl: check.imageUrl,
    price: check.price,
    currency: check.currency,
  }).where(eq(products.id, selected.id)).returning();

  if (!altered) {
    return c.json(
      {
        message: HTTP_STATUS_MESSAGES.NOT_FOUND,
      },
      HTTP_STATUS_CODES.NOT_FOUND,
    );
  }

  return c.json({
    ...altered,
    checkId: check.id,
  }, HTTP_STATUS_CODES.OK);
};

export const checkHistory: AppRouteHandler<CheckHistoryRoute> = async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.valid("param");

  const [product] = await db.select().from(products).where(
    and(
      eq(products.id, id),
      eq(products.userId, user.id),
    ),
  ).limit(1);

  if (!product) {
    return c.json(
      {
        message: HTTP_STATUS_MESSAGES.NOT_FOUND,
      },
      HTTP_STATUS_CODES.NOT_FOUND,
    );
  }

  const selected = await db.select().from(checks).where(
    eq(checks.productId, id),
  );

  if (!selected) {
    return c.json(
      {
        message: HTTP_STATUS_MESSAGES.NOT_FOUND,
      },
      HTTP_STATUS_CODES.NOT_FOUND,
    );
  }

  return c.json(selected, HTTP_STATUS_CODES.OK);
};

// export const patch: AppRouteHandler<PatchRoute> = async (c) => {
//   const user = c.get("user")!;
//   const { id } = c.req.valid("param");
//   const updates = c.req.valid("json");

//   if (Object.keys(updates).length === 0) {
//     return c.json(
//       {
//         success: false,
//         error: {
//           issues: [
//             {
//               code: ZOD_ERROR_CODES.INVALID_UPDATES,
//               path: [],
//               message: ZOD_ERROR_MESSAGES.NO_UPDATES,
//             },
//           ],
//           name: "ZodError",
//         },
//       },
//       HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
//     );
//   }

//   const [updated] = await db.update(tasks)
//     .set(updates)
//     .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
//     .returning();

//   if (!updated) {
//     return c.json(
//       {
//         message: HTTP_STATUS_MESSAGES.NOT_FOUND,
//       },
//       HTTP_STATUS_CODES.NOT_FOUND,
//     );
//   }

//   return c.json(updated, HTTP_STATUS_CODES.OK);
// };

export const remove: AppRouteHandler<RemoveRoute> = async (c) => {
  const user = c.get("user")!;
  const { id } = c.req.valid("param");
  const [deleted] = await db.delete(products).where(
    and(
      eq(products.id, id),
      eq(products.userId, user.id),
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
