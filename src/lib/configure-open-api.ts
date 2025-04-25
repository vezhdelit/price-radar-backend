import { swaggerUI } from "@hono/swagger-ui";
import { Scalar } from "@scalar/hono-api-reference";
import deepmerge from "deepmerge";

import type { AppOpenAPI } from "@/types/hono";

import packageJSON from "../../package.json" with { type: "json" };
import { auth } from "./auth";

function changeOpenAPISchemaTags(openAPISchema: any, tag: string) {
  // Change the tag for all paths endpoints to "Auth"
  for (const path in openAPISchema.paths) {
    const methods = openAPISchema.paths[path] as Record<string, { tags?: string[] }>;
    for (const method in methods) {
      const methodDetails = methods[method];
      if (methodDetails && Array.isArray(methodDetails.tags)) {
        methodDetails.tags = [tag];
      }
    }
  }

  // Update the tags definition to reflect the change
  openAPISchema.tags = [{ name: tag, description: "Authentication endpoints" }];

  return openAPISchema;
}

function addBasePathToOpenAPISchema(openAPISchema: any, basePath: string) {
  const newPaths: Record<string, any> = {};
  for (const path in openAPISchema.paths) {
    newPaths[`${basePath}${path}`] = openAPISchema.paths[path];
  }
  openAPISchema.paths = newPaths;

  // Update server URLs if they don't already include the basePath
  if (openAPISchema.servers && Array.isArray(openAPISchema.servers)) {
    openAPISchema.servers = openAPISchema.servers.map((server: { url: string }) => {
      if (!server.url.endsWith(basePath)) {
        server.url = `${server.url}${basePath}`;
      }
      return server;
    });
  }

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

    authOpenAPISchema = changeOpenAPISchemaTags(authOpenAPISchema, "Auth");
    authOpenAPISchema = addBasePathToOpenAPISchema(authOpenAPISchema, "/api/auth");
    authOpenAPISchema.servers = [];

    const mergedOpenAPISchema = deepmerge(openAPISchema, authOpenAPISchema);

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
