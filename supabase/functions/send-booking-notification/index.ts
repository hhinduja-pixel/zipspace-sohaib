import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAILS = ["support@zipspace.in", "admin@zipspace.in", "hhinduja@gmail.com"];

const storagePlanNames: Record<string, string> = {
  economy: "Economy (₹1,499/month)",
  walk_in_closet: "Walk-In Closet (₹2,499/month)",
  store_room: "Store Room (₹4,999/month)",
  premium: "Premium (₹12,999/month)",
  custom: "Custom Plans for Businesses",
};

const servicePlanNames: Record<string, string> = {
  basic: "Basic (Free)",
  elite: "Elite (₹1,799/month)",
};

const boxTypeNames: Record<string, string> = {
  medium: "Medium Box",
  large: "Large Box",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const booking = await req.json();
    console.log("Received booking data:", JSON.stringify(booking));

    const {
      customerName,
      email,
      phone,
      address,
      serviceType,
      storagePlan,
      servicePlan,
      numberOfBoxes,
      boxType,
      storageDuration,
    } = booking;

    // Build booking details based on service type
    let serviceDetails = "";
    if (serviceType === "store_boxes") {
      serviceDetails = `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Service Type:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">Store Boxes</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Number of Boxes:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${numberOfBoxes || "Not specified"}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Box Type:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${boxTypeNames[boxType] || boxType || "Not specified"}</td>
        </tr>
      `;
    } else if (serviceType === "storage_plan") {
      serviceDetails = `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Service Type:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">Storage Plan</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Storage Plan:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${storagePlanNames[storagePlan] || storagePlan || "Not specified"}</td>
        </tr>
      `;
    }

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
        ${serviceDetails}
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Service Plan:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${servicePlanNames[servicePlan] || servicePlan || "Basic"}</td>
        </tr>
        ${
          storageDuration
            ? `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Storage Duration:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${storageDuration}</td>
        </tr>
        `
            : ""
        }
      </table>
    `;

    // Send email to admin(s) - this is the primary notification
    console.log("Sending email to admins:", ADMIN_EMAILS);
    const adminEmailResult = await resend.emails.send({
      from: "ZipSpace <onboarding@resend.dev>",
      to: ADMIN_EMAILS,
      subject: `New Booking Request - ${customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1a365d; text-align: center;">New Booking Request</h1>
          <p style="color: #666; text-align: center;">A new booking request has been submitted.</p>
          <h3 style="color: #1a365d;">Booking Details:</h3>
          ${bookingDetails}
          <p style="color: #666;">Please contact the customer to confirm this booking.</p>
        </div>
      `,
    });
    console.log("Admin email result:", JSON.stringify(adminEmailResult));

    // Only send customer email if they provided a valid email
    if (email && email !== "not-provided@zipspace.in") {
      console.log("Sending confirmation email to customer:", email);
      const customerEmailResult = await resend.emails.send({
        from: "ZipSpace <onboarding@resend.dev>",
        to: [email],
        subject: "Booking Request Received - ZipSpace Storage",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a365d; text-align: center;">ZipSpace</h1>
            <h2 style="color: #2ab7a9; text-align: center;">Thank You for Your Request! 🎉</h2>
            <p style="color: #333;">Dear ${customerName},</p>
            <p style="color: #666;">Thank you for choosing ZipSpace! We've received your booking request and our team will call you shortly to confirm the details.</p>
            <h3 style="color: #1a365d;">Your Request Details:</h3>
            ${bookingDetails}
            <div style="background: #f0fdf4; border-radius: 10px; padding: 20px; margin: 20px 0;">
              <p style="color: #166534; margin: 0;"><strong>What's Next?</strong></p>
              <p style="color: #166534; margin: 10px 0 0;">Our team will call you shortly to confirm your booking and schedule the pickup.</p>
            </div>
            <p style="color: #666;">If you have any questions, feel free to reach us on WhatsApp at +91 9920714625.</p>
            <p style="color: #666;">Best regards,<br/>The ZipSpace Team</p>
          </div>
        `,
      });
      console.log("Customer email result:", JSON.stringify(customerEmailResult));
    }

    console.log("Booking notification emails sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-booking-notification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
