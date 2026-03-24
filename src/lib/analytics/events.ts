/**
 * Async analytics event capture.
 * Fire-and-forget pattern — never blocks API responses.
 */

import "server-only";
import { getSupabaseAdmin } from "@/lib/db/client";

export interface AnalyticsEvent {
  readonly session_id: string;
  readonly event_type: string;
  readonly event_action: string;
  readonly language?: string;
  readonly processing_time_ms?: number;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Capture an analytics event asynchronously.
 * Silently fails — analytics should never break the user experience.
 */
export function captureEvent(event: AnalyticsEvent): void {
  (async () => {
    try {
      const supabase = getSupabaseAdmin();
      await supabase.from("analytics_events").insert({
        session_id: event.session_id,
        event_type: event.event_type,
        event_action: event.event_action,
        language: event.language ?? "en",
        processing_time_ms: event.processing_time_ms,
        metadata: event.metadata ?? {},
      });
    } catch (err) {
      console.error("[analytics] Event capture failed:", err);
    }
  })();
}
