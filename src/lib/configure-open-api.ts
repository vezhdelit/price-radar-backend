import { swaggerUI } from "@hono/swagger-ui";
import { Scalar } from "@scalar/hono-api-reference";
import deepmerge from "deepmerge";

import type { AppOpenAPI } from "@/types/hono";

import packageJSON from "../../package.json" with { type: "json" };
import { auth } from "./auth";

interface PathConfig {
  tags?: string[];
  exclude?: boolean;
}

function processAuthOpenAPISchema(openAPISchema: any, pathConfigurations: Record<string, PathConfig>) {
  const newPaths: Record<string, any> = {};
  const tags: Record<string, { name: string; description: string }> = {};
  const orderedTags: string[] = [
    "Registration",
    "Auth & Sessions",
    "Password Management",
    "Account Management",
    "Accounts", // Keep "Accounts" as it was
  ];

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
            tags[tag] = { name: tag, description: `${tag} related operations` };
          }
        });
      }
    }

    newPaths[`/api/auth${path}`] = openAPISchema.paths[path];
  }

  openAPISchema.paths = newPaths;
  // Order the tags based on the orderedTags array
  openAPISchema.tags = orderedTags
    .map(tagName => tags[tagName])
    .filter(tag => !!tag); // Filter out any tags that might not have been used
  openAPISchema.servers = []; // Remove auth server URLs as they are now under /api/auth

  return openAPISchema;
}

export default function configureOpenAPI(app: AppOpenAPI) {
  app.get("/openapi", async (c) => {
    const openAPISchema = app.getOpenAPI31Document({
      openapi: "3.0.0",
      info: {
        version: packageJSON.version,
        title: "Tasks API",
        description: "API for managing tasks",
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
      servers: [
        {
          url: "http://localhost:9999",
        },
        {
          url: "https://api.example.com",
        },
      ],
    });

    let authOpenAPISchema = await auth.api.generateOpenAPISchema();

    const pathConfigurations: Record<string, PathConfig> = {
      // Registration
      "/sign-up/email": { tags: ["Registration"] },
      "/verify-email": { tags: ["Registration"] },
      "/send-verification-email": { tags: ["Registration"] },

      // Auth & Sessions
      "/sign-in/email": { tags: ["Auth & Sessions"] },
      "/sign-in/social": { tags: ["Auth & Sessions"] },
      "/get-session": { tags: ["Auth & Sessions"] },
      "/refresh-token": { tags: ["Auth & Sessions"] },
      "/list-sessions": { tags: ["Auth & Sessions"] },
      "/revoke-session": { tags: ["Auth & Sessions"] },
      "/revoke-sessions": { tags: ["Auth & Sessions"] },
      "/revoke-other-sessions": { tags: ["Auth & Sessions"] },
      "/sign-out": { tags: ["Auth & Sessions"] },

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

    authOpenAPISchema = processAuthOpenAPISchema(authOpenAPISchema, pathConfigurations);

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
