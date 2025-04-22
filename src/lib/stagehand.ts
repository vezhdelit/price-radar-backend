import type { AvailableModel, ConstructorParams as StagehandConstructorParams } from "@browserbasehq/stagehand";

import { Stagehand } from "@browserbasehq/stagehand";
import OpenAI from "openai";

import env from "@/env";
import { CustomOpenAIClient } from "@/lib/custom-openai-client";
import { LLMS } from "@/types/llm";

const PREFERRED_LLM_PROVIDER = env.PREFERRED_LLM_PROVIDER;
const PREFERRED_LLM_MODEL = env.PREFERRED_LLM_MODEL;
const HEADLESS = env.HEADLESS;
const BROWSER_TYPE = env.BROWSER_TYPE;

const baseStealthConfig = {
  extraHTTPHeaders: {
    "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
  },
  args: [
    "--disable-blink-features=AutomationControlled",
    "--no-sandbox",
    "--disable-setuid-sandbox", // Prevent detection from sandboxing
    "--start-maximized", // Ensure browser starts maximized
    "--disable-infobars", // Hide automation info bar
  ],

};

interface StagehandOptions {
  provider?: string;
  model?: string;
  browserType?: "default" | "configured" | "executable";
}

export function getStagehand({
  provider = PREFERRED_LLM_PROVIDER,
  model = PREFERRED_LLM_MODEL,
  browserType = BROWSER_TYPE,
}: StagehandOptions) {
  const foundProvider = LLMS[provider as keyof typeof LLMS];
  if (!foundProvider) {
    throw new Error(`Provider ${provider} not found`);
  }
  const foundModel = foundProvider.find(m => m.name === model);
  if (!foundModel) {
    throw new Error(`Model ${model} not found for provider ${provider}`);
  }

  const stagehandConfig: StagehandConstructorParams = {
    env: "LOCAL",
    verbose: 1,
    enableCaching: true,
    localBrowserLaunchOptions: {
      headless: HEADLESS,
    },
  };
  if (browserType === "configured") {
    stagehandConfig.localBrowserLaunchOptions = {
      ...baseStealthConfig,
    };
  }
  if (browserType === "executable") {
    stagehandConfig.localBrowserLaunchOptions = {
      ...baseStealthConfig,
      executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    };
  }

  if (provider === "google" && foundModel.stagehand_native_support) {
    return new Stagehand({
      modelName: foundModel.name as AvailableModel,
      modelClientOptions: {
        apiKey: env.GOOGLE_API_KEY,
      },
      ...stagehandConfig,
    });
  }

  if (provider === "google" && !foundModel.stagehand_native_support) {
    return new Stagehand({
      llmClient: new CustomOpenAIClient({
        modelName: foundModel.name,
        client: new OpenAI({
          apiKey: env.GOOGLE_API_KEY,
        }),
      }),
      ...stagehandConfig,
    });
  }

  if (provider === "openai" && foundModel.stagehand_native_support) {
    return new Stagehand({
      modelName: foundModel.name as AvailableModel,
      modelClientOptions: {
        apiKey: env.OPENAI_API_KEY,
      },
      ...stagehandConfig,
    });
  }

  if (provider === "openai" && !foundModel.stagehand_native_support) {
    return new Stagehand({
      llmClient: new CustomOpenAIClient({
        modelName: foundModel.name,
        client: new OpenAI({
          apiKey: env.OPENAI_API_KEY,
        }),
      }),
      ...stagehandConfig,
    });
  }
}
