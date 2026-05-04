import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<"loading" | "valid" | "already" | "invalid" | "done" | "error">("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    fetch(`${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`, {
      headers: { apikey: ANON },
    })
      .then(r => r.json())
      .then(d => {
        if (d.valid) setState("valid");
        else if (d.reason === "already_unsubscribed") setState("already");
        else setState("invalid");
      })
      .catch(() => setState("error"));
  }, [token]);

  const confirm = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", { body: { token } });
    setBusy(false);
    if (error) { setState("error"); return; }
    if (data?.success || data?.reason === "already_unsubscribed") setState("done");
    else setState("error");
  };

  return (
    <main className="min-h-screen bg-cream text-ink flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <h1 className="font-display text-3xl mb-4">Unsubscribe</h1>
        {state === "loading" && <p className="text-ink/70">Verifying…</p>}
        {state === "valid" && (
          <>
            <p className="text-ink/70 mb-6">Click below to unsubscribe from our emails.</p>
            <Button onClick={confirm} disabled={busy} className="bg-ink text-cream rounded-full px-8 py-6">
              {busy ? "Processing…" : "Confirm unsubscribe"}
            </Button>
          </>
        )}
        {state === "already" && <p className="text-ink/70">You are already unsubscribed.</p>}
        {state === "done" && <p className="text-ink/70">You have been unsubscribed. Sorry to see you go.</p>}
        {state === "invalid" && <p className="text-ink/70">Invalid or expired link.</p>}
        {state === "error" && <p className="text-ink/70">Something went wrong. Please try again later.</p>}
      </div>
    </main>
  );
}
