// Heimdall reporter: one counts-only event per Willow request.
// Sink and schema: https://github.com/MenokoOG/heimdall (src/shared/event.ts).
//
// COUNTS ONLY. The payload is enums and booleans. What a visitor typed must never
// be added here; the sink rejects unknown fields, so it would fail loudly anyway.
//
// Off unless HEIMDALL_URL and HEIMDALL_KEY are both set. Never throws, and waits
// at most 800ms so an unreachable sink cannot slow Willow's answer.

const WAIT_MS = 800;

export type LatencyBand = "lt500" | "lt1500" | "lt4000" | "gte4000";
export type ErrorClass = "none" | "upstream" | "timeout" | "internal";

export interface Outcome {
  mode: "live" | "offline";
  degraded: boolean;
  error: ErrorClass;
}

export const latencyBand = (ms: number): LatencyBand =>
  ms < 500 ? "lt500" : ms < 1500 ? "lt1500" : ms < 4000 ? "lt4000" : "gte4000";

export async function report(outcome: Outcome, startedAt: number): Promise<void> {
  const url = process.env.HEIMDALL_URL;
  const key = process.env.HEIMDALL_KEY;
  if (!url || !key) return;
  try {
    await fetch(`${url.replace(/\/$/, "")}/api/ingest`, {
      method: "POST",
      signal: AbortSignal.timeout(WAIT_MS),
      headers: { "Content-Type": "application/json", "x-heimdall-key": key },
      body: JSON.stringify({
        v: 1,
        agent: "willow",
        mode: outcome.mode,
        degraded: outcome.degraded,
        latency: latencyBand(Date.now() - startedAt),
        error: outcome.error,
      }),
    });
  } catch {
    /* never let the observer break Willow */
  }
}
