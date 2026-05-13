import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const ROBOFLOW_API_KEY = "I5hw46JRQGOFEHOwhB83";
const WORKSPACE = "kanishqs-workspace-sqcbc";
const WORKFLOW_ID = "general-segmentation-api-2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { imageBase64, imageUrl } = await req.json();
    if (!imageBase64 && !imageUrl) {
      return new Response(JSON.stringify({ error: "imageBase64 or imageUrl required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = {
      api_key: ROBOFLOW_API_KEY,
      inputs: {
        image: imageBase64
          ? { type: "base64", value: imageBase64 }
          : { type: "url", value: imageUrl },
        classes: "Pothole, Garbage, Civic2",
      },
    };

    const resp = await fetch(
      `https://serverless.roboflow.com/infer/workflows/${WORKSPACE}/${WORKFLOW_ID}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await resp.json();
    if (!resp.ok) {
      console.error("Roboflow error:", data);
      return new Response(JSON.stringify({ error: "Detection failed", details: data }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract predictions/classes
    const outputs = Array.isArray(data?.outputs) ? data.outputs[0] ?? {} : data?.outputs ?? {};
    let predictions: any[] = [];
    let annotatedImage: string | null = null;

    for (const v of Object.values(outputs)) {
      if (v && typeof v === "object") {
        const maybe = (v as any).predictions ?? (v as any).output ?? null;
        if (Array.isArray(maybe)) predictions = maybe;
        else if (maybe?.predictions) predictions = maybe.predictions;
        if ((v as any).type === "base64" && (v as any).value) annotatedImage = (v as any).value;
      }
    }

    const classes = Array.from(
      new Set(predictions.map((p: any) => p.class).filter(Boolean))
    );
    const top = classes[0] || null;

    return new Response(
      JSON.stringify({ success: true, classes, top, predictions, annotatedImage, raw: data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("detect-issue error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
