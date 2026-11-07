import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

const VISITOR_ID_KEY = "portfolio_visitor_id";

function getOrCreateVisitorId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let id = window.localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return null; // localStorage unavailable (private mode, etc.) — skip silently.
  }
}

// Records a page hit (page_views, one row per load) and a deduplicated
// visitor (site_visitors, one row per distinct browser) via SECURITY
// DEFINER RPCs, so anonymous visitors can be counted without granting
// direct table access.
export function ViewTracker() {
  const router = useRouter();
  useEffect(() => {
    function record() {
      const path = window.location.pathname || "/";
      supabase.rpc("record_page_view", { _path: path }).then(({ error }) => {
        if (error) console.error("[ViewTracker] record_page_view failed:", error.message);
      });
      const visitorId = getOrCreateVisitorId();
      if (visitorId) {
        supabase.rpc("record_site_visit", { _visitor_id: visitorId }).then(({ error }) => {
          if (error) console.error("[ViewTracker] record_site_visit failed:", error.message);
        });
      }
    }
    record();
    const unsubscribe = router.subscribe("onResolved", record);
    return unsubscribe;
  }, [router]);
  return null;
}
