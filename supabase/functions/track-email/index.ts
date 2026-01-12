import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// 1x1 transparent GIF pixel
const TRACKING_PIXEL = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
  0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21,
  0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00,
  0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
  0x01, 0x00, 0x3b
]);

serve(async (req) => {
  const url = new URL(req.url);
  const emailId = url.searchParams.get("id");
  const action = url.searchParams.get("action"); // "open" or "click"
  const redirect = url.searchParams.get("redirect");

  if (!emailId) {
    return new Response("Missing email ID", { status: 400 });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date().toISOString();

    if (action === "open") {
      // Track email open
      await supabase
        .from("email_sequences")
        .update({ opened_at: now })
        .eq("id", emailId)
        .is("opened_at", null); // Only update if not already opened

      console.log(`Email opened: ${emailId}`);

      // Return tracking pixel
      return new Response(TRACKING_PIXEL, {
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
    } else if (action === "click" && redirect) {
      // Track email click
      await supabase
        .from("email_sequences")
        .update({ clicked_at: now })
        .eq("id", emailId)
        .is("clicked_at", null); // Only update if not already clicked

      console.log(`Email clicked: ${emailId}, redirecting to: ${redirect}`);

      // Redirect to the actual URL
      return new Response(null, {
        status: 302,
        headers: {
          "Location": redirect,
        },
      });
    }

    return new Response("Invalid action", { status: 400 });
  } catch (error) {
    console.error("Error tracking email:", error);
    
    // Still return pixel/redirect even on error to not break user experience
    if (action === "open") {
      return new Response(TRACKING_PIXEL, {
        headers: { "Content-Type": "image/gif" },
      });
    } else if (redirect) {
      return new Response(null, {
        status: 302,
        headers: { "Location": redirect },
      });
    }
    
    return new Response("Error", { status: 500 });
  }
});
