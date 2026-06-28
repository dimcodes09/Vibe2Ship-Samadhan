const NVIDIA_BASE = "https://integrate.api.nvidia.com/v1";
const VISION_MODEL = "meta/llama-3.2-11b-vision-instruct";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Rate limiter helper based on client IP
const requestLog = new Map<string, number[]>();
function isRateLimited(ip: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > limit;
}

const SYSTEM_PROMPT = `You are a strict Indian civic document verification officer.
Analyze the provided document scan/photo and determine if it is a valid government document (e.g. Aadhaar Card, PAN Card, Driving License, Income Certificate, Property Tax Receipt, Passport, or other official government certificate/card).

If it is NOT a valid government document (for example, it is a selfie, meme, landscape, street photo, pothole image, garbage heap, private letter, food bill, or blank page), you MUST set "supported" to false and provide a clear, helpful "rejection_reason" explaining what was detected and why it is not accepted.

If it is a supported government document, set "supported" to true and extract structured details:
- Identify the document_type as one of: "aadhaar", "pan", "license", "income", "property", "other".
- Determine status: "expires_soon" (if it has an expiry date within the next 30 days), "verified" (if it is a recognized authentic card/certificate not expiring soon), or "uploaded" (general default).
- Extract holder_name (Full name of the document holder, exactly as written).
- Extract document_number (ID number/unique code, mask middle digits if sensitive).
- Extract dob_or_issuance (Date of birth or issuance date in YYYY-MM-DD format if present).
- Extract expiry_date (Expiry date in YYYY-MM-DD format if present, else null).
- Extract address (Full address if present, else null).
- Extract issuing_authority (e.g., UIDAI, Income Tax Department, Transport Department).
- Provide a complete transcription in "ocr_text".
- Provide a 2-sentence user-friendly plain-text summary in "ai_summary" explaining what the document is and its validity.

Respond ONLY with a valid JSON object matching this schema (do not include markdown headers or block formatting):
{
  "supported": boolean,
  "rejection_reason": string | null,
  "document_type": "aadhaar" | "pan" | "license" | "income" | "property" | "other" | null,
  "status": "verified" | "expires_soon" | "uploaded" | null,
  "ocr_text": string | null,
  "ai_summary": string | null,
  "metadata": {
    "holder_name": string | null,
    "document_number": string | null,
    "dob_or_issuance": string | null,
    "expiry_date": string | null,
    "address": string | null,
    "issuing_authority": string | null
  }
}
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    if (isRateLimited(ip)) {
      return errorResponse("Too many requests. Please wait a moment and try again.", 429);
    }

    // 1. Parse request body
    const body = await req.json();
    const { fileBase64, mimeType } = body;

    if (!fileBase64 || !mimeType) {
      return errorResponse("fileBase64 and mimeType are required", 400);
    }

    const allowedMimes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedMimes.includes(mimeType)) {
      return errorResponse("Only PDF, JPEG, PNG, or WebP files are accepted", 400);
    }

    // 2. Invoke NVIDIA NIM Llama 3.2 Vision Model
    const visionResponse = await callNvidiaNIM(VISION_MODEL, [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${fileBase64}` }
          },
          { type: "text", text: SYSTEM_PROMPT }
        ]
      }
    ]);

    // 3. Parse JSON output
    let result;
    const rawText = visionResponse.choices[0]?.message?.content || "";
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch![0]);
    } catch (e) {
      console.error("VLM output parsing failed. Raw text:", rawText, e);
      return errorResponse(`Failed to parse document analysis from the vision model. Raw VLM text: "${rawText}"`, 500);
    }

    // 4. Return structured VLM result
    return jsonResponse({
      success: true,
      data: result
    });

  } catch (err: any) {
    console.error("analyze-document error:", err);
    return errorResponse(`Internal server error: ${err.message || err}`, 500);
  }
});

// Helpers

async function callNvidiaNIM(model: string, messages: any[]) {
  const nvidiaKey = Deno.env.get("NVIDIA_NIM_API_KEY");
  if (!nvidiaKey) {
    throw new Error("NVIDIA_NIM_API_KEY environment variable is missing on this Supabase project.");
  }

  const res = await fetch(`${NVIDIA_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${nvidiaKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ model, messages, max_tokens: 2048, temperature: 0.1 })
  });

  if (!res.ok) {
    throw new Error(`NVIDIA NIM error: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" }
  });
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ status: "error", message }, status);
}
