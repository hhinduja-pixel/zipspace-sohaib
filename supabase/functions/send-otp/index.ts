import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Delete any existing OTPs for this email
    await supabase.from("otp_codes").delete().eq("email", email);

    // Insert new OTP
    const { error: insertError } = await supabase.from("otp_codes").insert({
      email,
      code: otp,
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) {
      console.error("Error inserting OTP:", insertError);
      throw new Error("Failed to generate OTP");
    }

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: "ZipSpace <onboarding@resend.dev>",
      to: [email],
      subject: "Your ZipSpace Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a365d; text-align: center;">ZipSpace</h1>
          <h2 style="color: #333; text-align: center;">Your Verification Code</h2>
          <div style="background: #f7fafc; border-radius: 10px; padding: 30px; text-align: center; margin: 20px 0;">
            <p style="font-size: 36px; font-weight: bold; color: #2ab7a9; letter-spacing: 8px; margin: 0;">${otp}</p>
          </div>
          <p style="color: #666; text-align: center;">This code will expire in 10 minutes.</p>
          <p style="color: #666; text-align: center;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw new Error("Failed to send OTP email");
    }

    console.log("OTP sent successfully to:", email);

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
