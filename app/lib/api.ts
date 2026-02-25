const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

interface ApiOptions extends RequestInit {
  body?: unknown;
}

export const apiCall = async <T = unknown>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> => {
  const config: RequestInit = {
    ...options,
    // 'include' sends cookies automatically — this replaces localStorage token reads
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body);
  }

  // If endpoint starts with /api, use relative URL (Next.js API routes)
  // Otherwise use the external API_URL (your Express backend)
  const url = endpoint.startsWith("/api") ? endpoint : `${API_URL}${endpoint}`;

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "API request failed");
  }

  return response.json();
};
