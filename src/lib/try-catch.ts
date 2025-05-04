import type { FuncResult } from "@/types/func";

// Main wrapper function
export async function tryCatch<T, E = Error>(
  promise: Promise<T>,
): Promise<FuncResult<T, E>> {
  try {
    const data = await promise;
    return { data, error: null };
  }
  catch (error) {
    return { data: null, error: error as E };
  }
}
