import { swaggerUI } from "@hono/swagger-ui";
import { apiReference } from "@scalar/hono-api-reference";

import type { AppOpenAPI } from "./types";

import packageJSON from "../../package.json" with { type: "json" };

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc31("/openapi", {
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
