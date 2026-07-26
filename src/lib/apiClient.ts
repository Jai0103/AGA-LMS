import type { ApiRequest, ApiResponse } from "../types/api";

const API_URL = import.meta.env.VITE_APPS_SCRIPT_API_URL as string | undefined;

export function isAuthFailureCode(code: string): boolean {
  return code === "UNAUTHORIZED" || code === "FORBIDDEN";
}

export async function apiRequest<TData, TPayload = Record<string, unknown>>(
  action: string,
  payload: TPayload,
  sessionToken = "",
): Promise<ApiResponse<TData>> {
  if (!API_URL || API_URL.includes("YOUR_DEPLOYMENT_ID")) {
    return {
      ok: false,
      error: {
        code: "API_URL_MISSING",
        message: "VITE_APPS_SCRIPT_API_URL is not configured.",
      },
    };
  }

  const requestBody: ApiRequest<TPayload> = {
    action,
    payload,
    sessionToken,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    let data: ApiResponse<TData>;

    try {
      data = (await response.json()) as ApiResponse<TData>;
    } catch {
      return {
        ok: false,
        error: {
          code: "BAD_RESPONSE",
          message: "The backend returned an unreadable response.",
        },
      };
    }

    return data;
  } catch {
    return {
      ok: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Could not reach the Apps Script API.",
      },
    };
  }
}
