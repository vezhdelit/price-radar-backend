import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";

const app = createApp();

configureOpenAPI(app);

const routes = [] as const;

routes.forEach((route) => {
  app.route("/", route);
});

export type AppType = typeof routes[number];

export default app;
