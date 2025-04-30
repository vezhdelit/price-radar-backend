import { swaggerUI } from "@hono/swagger-ui";
import { Scalar } from "@scalar/hono-api-reference";
import deepmerge from "deepmerge";

import type { AppOpenAPI } from "@/types/hono";

import env from "@/env";

import packageJSON from "../../package.json" with { type: "json" };
import { auth } from "./auth";

const TAGS = [
  {
    name: "Auth",
    description: "App using cokkie authentication",
  },
  {
    name: "Session Management",
    description: "Session management related operations",
  },
  {
    name: "Password Management",
    description: "Password management related operations",
  },
  {
    name: "Account Management",
    description: "Account management related operations",
  },
];

const PATH_CONFIG: Record<string, PathConfig> = {
  // Auth
  "/sign-up/email": { tags: ["Auth"] },
  "/verify-email": { tags: ["Auth"] },
  "/send-verification-email": { tags: ["Auth"] },
  "/sign-in/email": { tags: ["Auth"] },
  "/sign-in/social": { tags: ["Auth"] },
  "/sign-out": { tags: ["Auth"] },

  // Session Management
  "/get-session": { tags: ["Session Management"] },
  "/refresh-token": { tags: ["Session Management"] },
  "/list-sessions": { tags: ["Session Management"] },
  "/revoke-session": { tags: ["Session Management"] },
  "/revoke-sessions": { tags: ["Session Management"] },
  "/revoke-other-sessions": { tags: ["Session Management"] },

  // Password Management
  "/forget-password": { tags: ["Password Management"] },
  "/reset-password": { tags: ["Password Management"] },
  "/reset-password/{token}": { tags: ["Password Management"] },

  // Account Management
  "/change-email": { tags: ["Account Management"] },
  "/change-password": { tags: ["Account Management"] },
  "/update-user": { tags: ["Account Management"] },
  "/delete-user": { tags: ["Account Management"] },
  "/list-accounts": { tags: ["Account Management"] },
  "/unlink-account": { tags: ["Account Management"] },
  "/link-social": { tags: ["Account Management"] },

  // Excluded
  "/delete-user/callback": { exclude: true },
  "/ok": { exclude: true },
  "/error": { exclude: true },
};
interface PathConfig {
  tags?: string[];
  exclude?: boolean;
}

function processAuthOpenAPISchema(openAPISchema: any, pathConfigurations: Record<string, PathConfig>) {
  const newPaths: Record<string, any> = {};
  const tags: Record<string, { name: string; description: string }> = {};

  for (const path in openAPISchema.paths) {
    const config = pathConfigurations[path];
    if (config?.exclude) {
      continue; // Skip excluded paths
    }

    const methods = openAPISchema.paths[path] as Record<string, { tags?: string[] }>;
    const assignedTags = config?.tags || ["Auth"]; // Default to "Auth" if no specific tags

    for (const method in methods) {
      const methodDetails = methods[method];
      if (methodDetails) {
        methodDetails.tags = assignedTags;
        assignedTags.forEach((tag) => {
          if (!tags[tag]) {
            tags[tag] = { name: tag, description: TAGS.find(t => t.name === tag)?.description || "" };
          }
        });
      }
    }

    newPaths[`/api/auth${path}`] = openAPISchema.paths[path];
  }

  openAPISchema.paths = newPaths;
  openAPISchema.tags = TAGS
    .map(t => tags[t.name])
    .filter(t => !!t);

  return openAPISchema;
}

export default function configureOpenAPI(app: AppOpenAPI) {
  app.get("/openapi", async (c) => {
    const servers = [];
    if (env.NODE_ENV === "development") {
      servers.push({
        url: "https://localhost:9999",
      });
    }
    servers.push(
      {
        url: "http://vezhdelit.com",
      },
    );

    const openAPISchema = app.getOpenAPI31Document({
      openapi: "3.0.0",
      info: {
        version: packageJSON.version,
        title: "Price radar API",
        description: "API for tracking prices of products from product url",
        contact: {
          name: "Your Name",
          email: "",
        },
        license: {
          name: "Placeholder License",
          url: "https://opensource.org/licenses/MIT",
        },
        termsOfService: "https://example.com/terms",
      },
      servers,
    });

    let authOpenAPISchema = await auth.api.generateOpenAPISchema();

    authOpenAPISchema = processAuthOpenAPISchema(authOpenAPISchema, PATH_CONFIG);
    authOpenAPISchema.servers = [];
    delete (authOpenAPISchema.components as any).securitySchemes;

    const mergedOpenAPISchema = deepmerge(authOpenAPISchema, openAPISchema);

    return c.json(mergedOpenAPISchema, 200);
  });

  app.get("/swagger", swaggerUI({
    url: "/openapi",
  }));

  app.get(
    "/docs",
    Scalar({
      theme: "fastify",
      hideDownloadButton: true,
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "axios",
      },
      url: "/openapi",
      layout: "modern",
      pageTitle: "Tasks API",
    }),
  );
}
