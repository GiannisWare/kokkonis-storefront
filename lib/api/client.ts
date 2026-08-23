import "server-only";

const REQUEST_TIMEOUT_MS = 5_000;
const REVALIDATE_SECONDS = 60;

export class ApiError extends Error {
  constructor(public readonly status: number | null = null) {
    super("The catalogue service is unavailable.");
    this.name = "ApiError";
  }
}

function getApiBaseUrl(): URL {
  const configuredUrl =
    process.env.LARAVEL_API_URL ??
    (process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000" : null);

  if (!configuredUrl) {
    throw new ApiError();
  }

  const url = new URL(configuredUrl);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ApiError();
  }

  return url;
}

export async function apiGet<T>(
  path: string,
  parse: (value: unknown) => T,
  tags: string[] = ["products"],
): Promise<T> {
  const url = new URL(path, getApiBaseUrl());

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags,
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new ApiError(response.status);
    }

    return parse(await response.json());
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError();
  }
}
