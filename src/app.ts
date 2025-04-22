import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import index from "@/routes/index/index.index";
import sandbox from "@/routes/sandbox/sandbox.index";
import tasks from "@/routes/tasks/tasks.index";

const app = createApp();

configureOpenAPI(app);

const routes = [
  index,
  sandbox,
  tasks,
] as const;

routes.forEach((route) => {
  // TODO: Remove this when zod-openapi fixes hide: true issue
  // @ts-expect-error - Hono does not support this yet
  app.route("/", route);
});

export type AppType = typeof routes[number];

export default app;
