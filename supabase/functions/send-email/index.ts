import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Para usar Resend, necesitas instalar: deno add npm:resend
// O puedes usar otro servicio de email como SendGrid, Mailgun, etc.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";

interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

serve(async (req) => {
  try {
    const { to, subject, html, from = "Pair Connect <noreply@pairconnect.dev>" } = await req.json() as EmailData;

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, html" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Si tienes Resend configurado
    if (RESEND_API_KEY) {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html,
        }),
      });

      if (!resendResponse.ok) {
        const error = await resendResponse.text();
        console.error("Resend error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to send email", details: error }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      const data = await resendResponse.json();
      return new Response(
        JSON.stringify({ success: true, id: data.id }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fallback: solo log (para desarrollo)
    console.log("📧 Email que se enviaría:", { to, subject, html });
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email logged (RESEND_API_KEY not configured)",
        email: { to, subject }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
