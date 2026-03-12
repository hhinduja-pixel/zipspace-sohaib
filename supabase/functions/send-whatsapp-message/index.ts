import { serve } from "std/server";

serve(async (req) => {
  try {
    const { phone, message } = await req.json();

    const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_TOKEN");
    const PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

    if (!phone || !message) {
      return new Response(JSON.stringify({ error: "Missing phone or message" }), { status: 400 });
    }
    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      return new Response(JSON.stringify({ error: "Server misconfiguration" }), { status: 500 });
    }

    const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;
    const payload = {
      messaging_product: "whatsapp",
      to: `91${phone}`,
      type: "text",
      text: { body: message },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error", details: String(err) }), { status: 500 });
  }
});
