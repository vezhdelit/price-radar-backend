import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import auth from "@/routes/auth/auth.index";
import cron from "@/routes/cron/cron.index";
import index from "@/routes/index/index.index";
import products from "@/routes/products/products.index";
import sandbox from "@/routes/sandbox/sandbox.index";

const app = createApp();

configureOpenAPI(app);

const routes = [
  auth,
  index,
  sandbox,
  cron,
  products,
] as const;

routes.forEach((route) => {
  app.route("/", route);
});

export type AppType = typeof routes[number];

export default app;
