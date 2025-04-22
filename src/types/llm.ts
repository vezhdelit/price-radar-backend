export const LLMS = {
  openai: [
    {
      name: "gpt-4.1-nano",
      stagehand_native_support: false,
    },
    {
      name: "gpt-4o-mini",
      stagehand_native_support: true,
    },
  ],
  google: [
    {
      name: "gemini-2.0-flash-lite",
      stagehand_native_support: true,
    },
    {
      name: "gemini-2.0-flash",
      stagehand_native_support: true,
    },
  ],
};

export type LLMProvider = keyof typeof LLMS;
export type LLMModel = typeof LLMS[LLMProvider][number]["name"];
