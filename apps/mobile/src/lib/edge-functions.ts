import { supabase } from "./supabase";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;

interface EdgeFunctionOptions {
  functionName: string;
  body: Record<string, unknown> | FormData;
  signal?: AbortSignal;
}

export async function callEdgeFunction<T>(
  options: EdgeFunctionOptions
): Promise<T> {
  const { functionName, body, signal } = options;

  // Always refresh session to ensure we have a valid token
  const { data, error: refreshError } = await supabase.auth.refreshSession();

  if (refreshError || !data.session) {
    console.error("Failed to refresh session:", refreshError);
    throw new Error("Not authenticated");
  }

  const session = data.session;

  // Log JWT details for debugging
  console.log("JWT Token details:", {
    tokenPrefix: session.access_token.substring(0, 20) + "...",
    tokenLength: session.access_token.length,
    expiresAt: session.expires_at,
    user: session.user?.id,
  });

  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;

  const headers: HeadersInit_ = {
    Authorization: `Bearer ${session.access_token}`,
  };

  console.log("Calling Edge Function:", functionName);

  // Only set Content-Type for JSON bodies (FormData sets its own)
  const isFormData = body instanceof FormData;
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: isFormData ? body : JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Edge function '${functionName}' failed:`, {
      status: response.status,
      error,
      url,
    });
    throw new Error(
      `Edge function '${functionName}' failed: ${response.status} ${error}`
    );
  }

  return response.json() as Promise<T>;
}
