// Edge function: fetch real Google reviews via Places API (New)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const placeId = url.searchParams.get("placeId");
    if (!placeId) {
      return new Response(JSON.stringify({ error: "Missing placeId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GOOGLE_PLACES_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fields = [
      "id",
      "displayName",
      "rating",
      "userRatingCount",
      "googleMapsUri",
      "reviews",
    ].join(",");

    const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}?languageCode=es`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fields,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Google Places error", res.status, data);
      return new Response(JSON.stringify({ error: data?.error?.message || "Places API error", status: res.status }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = {
      name: data?.displayName?.text ?? null,
      rating: data?.rating ?? null,
      total: data?.userRatingCount ?? null,
      mapsUrl: data?.googleMapsUri ?? null,
      reviews: (data?.reviews ?? []).map((r: any) => ({
        author: r?.authorAttribution?.displayName ?? "",
        photo: r?.authorAttribution?.photoUri ?? null,
        rating: r?.rating ?? 0,
        text: r?.text?.text ?? r?.originalText?.text ?? "",
        relative: r?.relativePublishTimeDescription ?? "",
        time: r?.publishTime ?? null,
      })),
    };

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=600",
      },
    });
  } catch (e) {
    console.error("google-reviews exception", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
