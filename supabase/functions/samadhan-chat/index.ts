import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Samadhan AI, a helpful civic governance assistant for Indian citizens. You specialize in:

1. **Civic Issues**: Help users understand how to report civic problems (roads, water, electricity, sanitation), track their status, and escalate issues appropriately.

2. **Government Schemes**: Provide accurate information about central and state government schemes like PM Kisan, Ayushman Bharat, PM Awas Yojana, MGNREGA, etc. Explain eligibility criteria, benefits, and application processes.

3. **Form Assistance**: Help users understand government forms, explain required documents, and guide them through filling applications.

4. **Document Guidance**: Advise on important documents (Aadhaar, PAN, Voter ID, Income Certificate, Caste Certificate, etc.) - how to apply, renew, or correct them.

Guidelines:
- Be warm, patient, and accessible - many users may not be tech-savvy
- Support both Hindi and English naturally in conversation (code-mixing is fine)
- Provide step-by-step guidance when explaining processes
- Always verify policy information and mention if something might have changed recently
- For complex queries, break down information into digestible parts
- If asked about something outside your scope, politely redirect to appropriate resources
- Never provide legal advice - recommend consulting lawyers for legal matters
- Be culturally sensitive and respectful of Indian customs and diversity

Start responses naturally without unnecessary greetings in follow-up messages. Be concise but thorough.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Unable to process your request. Please try again." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
