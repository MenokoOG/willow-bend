// Heimdall reporter on the Willow function: counts only, off by default,
// never breaks Willow.

import { afterEach, describe, expect, it, vi } from "vitest";
import handler from "../netlify/functions/willow";
import { latencyBand } from "../netlify/lib/heimdall";

const invoke = (content: string): Promise<Response> =>
  handler(
    new Request("http://localhost/api/willow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content }], chatRole: "guest" }),
    }),
  );

const sinkCall = (spy: ReturnType<typeof vi.fn>) =>
  spy.mock.calls.find(([u]) => String(u).includes("sink.example")) as [string, RequestInit];

const stubSink = (openai?: Response) =>
  vi.fn(async (u: unknown) =>
    String(u).includes("openai") && openai ? openai : new Response("{}", { status: 202 }),
  );

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("heimdall reporter", () => {
  it("bands latency at the edges", () => {
    expect(latencyBand(499)).toBe("lt500");
    expect(latencyBand(500)).toBe("lt1500");
    expect(latencyBand(4000)).toBe("gte4000");
  });

  it("sends nothing when HEIMDALL_URL or HEIMDALL_KEY is unset", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const spy = vi.fn();
    vi.stubGlobal("fetch", spy);
    expect((await invoke("hello")).status).toBe(501);
    expect(spy).not.toHaveBeenCalled();
  });

  it("reports a keyless request as offline, not degraded, with no visitor text", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("HEIMDALL_URL", "https://sink.example");
    vi.stubEnv("HEIMDALL_KEY", "k");
    const spy = stubSink();
    vi.stubGlobal("fetch", spy);

    await invoke("ZZZ-private-question-about-my-health");

    const [, init] = sinkCall(spy);
    const sent = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(Object.keys(sent).sort()).toEqual(["agent", "degraded", "error", "latency", "mode", "v"]);
    expect(sent).toMatchObject({ agent: "willow", mode: "offline", degraded: false, error: "none" });
    expect(init.body as string).not.toContain("ZZZ");
  });

  it("reports a good completion as live and a failed one as degraded", async () => {
    vi.stubEnv("OPENAI_API_KEY", "sk-test");
    vi.stubEnv("HEIMDALL_URL", "https://sink.example");
    vi.stubEnv("HEIMDALL_KEY", "k");

    const good = stubSink(
      new Response(JSON.stringify({ choices: [{ message: { content: "hi" } }] }), { status: 200 }),
    );
    vi.stubGlobal("fetch", good);
    expect((await invoke("hello")).status).toBe(200);
    expect(JSON.parse(sinkCall(good)[1].body as string)).toMatchObject({ mode: "live", degraded: false });

    const bad = stubSink(new Response("no", { status: 500 }));
    vi.stubGlobal("fetch", bad);
    expect((await invoke("hello")).status).toBe(502);
    expect(JSON.parse(sinkCall(bad)[1].body as string)).toMatchObject({
      mode: "offline",
      degraded: true,
      error: "upstream",
    });
  });

  it("still answers when the sink is down", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("HEIMDALL_URL", "https://sink.example");
    vi.stubEnv("HEIMDALL_KEY", "k");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect((await invoke("hello")).status).toBe(501);
  });
});
