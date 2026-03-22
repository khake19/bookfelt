import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RevenueCatEvent {
  event: {
    type: string;
    app_user_id: string;
    expiration_at_ms?: number;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify webhook secret (optional but recommended)
    const webhookSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
    if (webhookSecret) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader !== `Bearer ${webhookSecret}`) {
        console.error("Webhook authentication failed");
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const payload: RevenueCatEvent = await req.json();
    const { type, app_user_id, expiration_at_ms } = payload.event;

    console.log(`Processing RevenueCat event: ${type} for user ${app_user_id}`);

    // Create Supabase client with service role (bypasses RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine premium status based on event type
    let isPremium = false;
    let expiresAt: string | null = null;

    switch (type) {
      case "INITIAL_PURCHASE":
      case "RENEWAL":
      case "UNCANCELLATION":
        isPremium = true;
        if (expiration_at_ms) {
          expiresAt = new Date(expiration_at_ms).toISOString();
        }
        break;
      case "CANCELLATION":
        // Still premium until expiry date
        isPremium = true;
        if (expiration_at_ms) {
          expiresAt = new Date(expiration_at_ms).toISOString();
        }
        break;
      case "EXPIRATION":
      case "BILLING_ISSUE":
        isPremium = false;
        expiresAt = null;
        break;
      default:
        console.log(`Unhandled event type: ${type}`);
        return new Response(
          JSON.stringify({ received: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Update profile
    const { error } = await supabase.from("profiles").upsert({
      id: app_user_id,
      is_premium: isPremium,
      premium_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to update profile:", error);
      return new Response(
        JSON.stringify({ error: "Database update failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Updated user ${app_user_id}: isPremium=${isPremium}, expiresAt=${expiresAt}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
