import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAILS = ["admin@zipspace.in", "hhinduja@gmail.com"];

const storagePlanNames: Record<string, string> = {
  economy: "Economy (₹1,499/month)",
  walk_in_closet: "Walk-In Closet (₹2,499/month)",
  store_room: "Store Room (₹4,999/month)",
  premium: "Premium (₹12,999/month)",
};

const servicePlanNames: Record<string, string> = {
  basic: "Basic (Free)",
  elite: "Elite (₹1,799/month)",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const booking = await req.json();

    const {
      customerName,
      email,
      phone,
      address,
      storagePlan,
      servicePlan,
      pickupDate,
      pickupTimeSlot,
      totalAmount,
      isFirstTime,
    } = booking;

    const bookingDetails = `
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Customer Name:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${customerName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${phone}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Address:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${address}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Storage Plan:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${storagePlanNames[storagePlan] || storagePlan}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Service Plan:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${servicePlanNames[servicePlan] || servicePlan}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Pickup Date:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${pickupDate}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Pickup Time:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${pickupTimeSlot}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Total Amount:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; color: #2ab7a9; font-weight: bold;">₹${totalAmount}</td>
        </tr>
        ${isFirstTime ? `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">First-Time Discount:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; color: #22c55e;">15% OFF + FREE Pickup Applied!</td>
        </tr>
        ` : ""}
      </table>
    `;

    // Send email to customer
    await resend.emails.send({
      from: "ZipSpace <onboarding@resend.dev>",
      to: [email],
      subject: "Booking Confirmed - ZipSpace Storage",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a365d; text-align: center;">ZipSpace</h1>
          <h2 style="color: #2ab7a9; text-align: center;">Booking Confirmed! 🎉</h2>
          <p style="color: #333;">Dear ${customerName},</p>
          <p style="color: #666;">Thank you for choosing ZipSpace! Your pickup has been scheduled successfully.</p>
          <h3 style="color: #1a365d;">Booking Details:</h3>
          ${bookingDetails}
          <div style="background: #f0fdf4; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <p style="color: #166534; margin: 0;"><strong>What's Next?</strong></p>
            <p style="color: #166534; margin: 10px 0 0;">Our team will arrive at your location on the scheduled date and time to pick up your items.</p>
          </div>
          <p style="color: #666;">If you have any questions, feel free to reach us on WhatsApp at +91 9920714625.</p>
          <p style="color: #666;">Best regards,<br/>The ZipSpace Team</p>
        </div>
      `,
    });

    // Send email to admin(s)
    await resend.emails.send({
      from: "ZipSpace <onboarding@resend.dev>",
      to: ADMIN_EMAILS,
      subject: `New Booking - ${customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a365d; text-align: center;">New Booking Received</h1>
          <h3 style="color: #1a365d;">Booking Details:</h3>
          ${bookingDetails}
          <p style="color: #666;">Please ensure the pickup team is assigned for this booking.</p>
        </div>
      `,
    });

    console.log("Booking notification emails sent successfully");

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-booking-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
