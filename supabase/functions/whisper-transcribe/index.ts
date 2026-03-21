import { createClient } from "jsr:@supabase/supabase-js@2";

// --- Helper ---

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// --- Handler ---

Deno.serve(async (req) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  // Auth validation
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return errorResponse("Missing Authorization header", 401);
  }

  // Create Supabase client with auth header in global context
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: {
        headers: { Authorization: authHeader },
      },
    }
  );

  // Call getUser() without passing JWT explicitly - it uses the header from context
  const {
    data: { user },
    error: authError,
  } = await supabaseClient.auth.getUser();

  if (authError || !user) {
    console.error("Auth failed:", authError?.message);
    return errorResponse(
      authError?.message || "Authentication failed",
      401
    );
  }

  console.log("Auth successful:", user.id);

  // Get OpenAI API key
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) {
    return errorResponse("OpenAI API key not configured", 500);
  }

  // Parse FormData
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return errorResponse("Invalid FormData body", 400);
  }

  const audioFile = formData.get("file") as File;
  if (!audioFile) {
    return errorResponse("Missing 'file' field in FormData", 400);
  }

  // Forward to OpenAI Whisper API
  const openaiFormData = new FormData();
  openaiFormData.append("file", audioFile);
  openaiFormData.append("model", "whisper-1");

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
      },
      body: openaiFormData,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    return errorResponse(`Transcription failed: ${error}`, response.status);
  }

  const result = await response.json();
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json" },
  });
});
