import { swaggerUI } from "@hono/swagger-ui";
import { apiReference } from "@scalar/hono-api-reference";

import type { AppOpenAPI } from "./types";

import packageJSON from "../../package.json" with { type: "json" };

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/openapi", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: "Tasks API",
    },
  });

  app.get("/swagger", swaggerUI({
    url: "/openapi",
  }));

  app.get(
    "/docs",
    apiReference({
      theme: "alternate",
      hideDownloadButton: true,
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "axios",
      },
      spec: {
        url: "/openapi",
      },
      layout: "modern",
      pageTitle: "Tasks API",
    }),
  );
}
