type FetchOptions<T> = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: T;
  headers?: Record<string, string>;
  token?: string;
};

export async function apiFetch<T = unknown, R = unknown>(
  url: string,
  options: FetchOptions<T> = {}
): Promise<R> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (options.token) {
      headers["Authorization"] = `Bearer ${options.token}`;
    }

    const response = await fetch(url, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      let errorMessage = "Erro na requisição";
      if (contentType?.includes("application/json")) {
        const errorJson = await response.json();
        errorMessage = errorJson.message || JSON.stringify(errorJson);
      } else {
        errorMessage = await response.text();
      }
      throw new Error(errorMessage);
    }

    if (contentType && contentType.includes("application/json")) {
      return (await response.json()) as R;
    } else {
      return (await response.text()) as unknown as R;
    }
  } catch (err: unknown) {
    console.error("fetch error:", err);
    throw err;
  }
}
