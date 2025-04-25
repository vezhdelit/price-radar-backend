/* eslint-disable node/no-process-env */
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import path from "node:path";
import { z } from "zod";

import { LLMS } from "@/types/llm";

expand(config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === "test" ? ".env.test" : ".env",
  ),
}));

const LLM_PROVIDERS = Object.keys(LLMS) as [string, ...string[]];
const LLM_MODELS = Object.values(LLMS).flat().map(model => model.name) as [string, ...string[]];

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(9999),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),
  DATABASE_URL: z.string().url(),

  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url().optional(),

  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),

  HEADLESS: z.coerce.boolean().default(false),
  BROWSER_TYPE: z.enum(["default", "configured", "executable"]).default("default"),

  PREFERRED_LLM_PROVIDER: z.enum(LLM_PROVIDERS),
  PREFERRED_LLM_MODEL: z.enum(LLM_MODELS),

  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.PREFERRED_LLM_PROVIDER === "openai" && !data.OPENAI_API_KEY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["OPENAI_API_KEY"],
      message: "OPENAI_API_KEY is required when PREFERRED_LLM_PROVIDER is openai",
    });
  }
  if (data.PREFERRED_LLM_PROVIDER === "google" && !data.GOOGLE_API_KEY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["GOOGLE_API_KEY"],
      message: "GOOGLE_API_KEY is required when PREFERRED_LLM_PROVIDER is google",
    });
  }

  const providerModels = LLMS[data.PREFERRED_LLM_PROVIDER as keyof typeof LLMS].map(model => model.name) as [string, ...string[]];
  if (!providerModels.includes(data.PREFERRED_LLM_MODEL)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["PREFERRED_LLM_MODEL"],
      message: `PREFERRED_LLM_MODEL must be one of ${providerModels.join(", ")} when PREFERRED_LLM_PROVIDER is ${data.PREFERRED_LLM_PROVIDER}`,
    });
  }
});

export type env = z.infer<typeof EnvSchema>;

// eslint-disable-next-line ts/no-redeclare
const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export default env!;
