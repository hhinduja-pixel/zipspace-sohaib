import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAILS = ["support@zipspace.in", "admin@zipspace.in", "hhinduja@gmail.com", "apnaabill@gmail.com"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, mobileNumber } = await req.json();

    console.log("Sending return request notification for:", email, mobileNumber);

    // Send email to admin(s)
    await resend.emails.send({
      from: "ZipSpace <onboarding@resend.dev>",
      to: ADMIN_EMAILS,
      subject: `Return Request - ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a365d; text-align: center;">New Return Request</h1>
          <p style="color: #666; text-align: center;">A customer has submitted a return request.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Mobile Number:</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">+91 ${mobileNumber}</td>
            </tr>
          </table>
          <p style="color: #666;">Please contact the customer to process their return request.</p>
        </div>
      `,
    });

    console.log("Return notification email sent successfully");

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-return-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
