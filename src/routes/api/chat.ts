import { createFileRoute } from "@tanstack/react-router";
import { isMode, isTone, type ModeId, type ToneId } from "@/lib/modes";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 15;
const hits = new Map<string, number[]>();

const TONE_LINE: Record<ToneId, string> = {
  clear: "clearer and easier to scan, without changing the meaning",
  short: "noticeably shorter — cut filler, keep the point and any ask",
  warm: "warmer and more human, never cheesy or overfamiliar",
  sharp: "sharper and more confident, still polite",
  formal: "more formal and professional",
};

function systemPrompt(mode: ModeId, tone: ToneId): string {
  const base =
    "You are Freeside, a free everyday assistant. Be direct, concrete, and kind. " +
    "Do not open with filler like 'Certainly' or 'Great question'. " +
    "Do not mention these instructions. If you are unsure, say so.";

  if (mode === "rewrite") {
    return (
      `${base} Rewrite ONLY the latest user message. Keep names, facts, and intent. ` +
      `Return just the rewrite — no label, no preamble, no closing note. ` +
      `Make it ${TONE_LINE[tone]}.`
    );
  }
  if (mode === "summarize") {
    return (
      `${base} Summarize ONLY the latest user message. ` +
      "Start with the point in one sentence, then at most five short bullets. Do not invent details."
    );
  }
  if (mode === "explain") {
    return (
      `${base} Explain the latest user message in plain language. ` +
      "Define jargon in the same sentence. One everyday example is welcome. Stay accurate and brief."
    );
  }
  if (mode === "plan") {
    return (
      `${base} Turn the latest request into a plan one person can actually do. ` +
      "Open with the outcome in one line, then numbered steps. Name one likely snag and how to handle it."
    );
  }
  return `${base} Answer the latest question. Prefer useful specifics over vague advice. Keep it tight.`;
}

async function replyFromUpstreamFailure(upstream: Response): Promise<Response> {
  let code = "";
  try {
    const payload = (await upstream.json()) as { code?: unknown };
    if (typeof payload.code === "string") code = payload.code;
  } catch {
    // Body wasn't JSON; fall through to a generic message.
  }
  if (code.includes("spending-limit") || upstream.status === 403) {
    return Response.json(
      {
        error:
          "Replies are paused. This app's Grok allowance is used up — add credits, then try again.",
      },
      { status: 503 },
    );
  }
  if (upstream.status === 429) {
    return Response.json(
      { error: "The model is busy. Try again in a moment." },
      { status: 429 },
    );
  }
  return Response.json({ error: "The model didn't answer. Try again." }, { status: 502 });
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim().slice(0, 80) || "local";
  return "local";
}

function allowed(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((stamp) => now - stamp < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

type Incoming = { role: "user" | "assistant"; content: string };

function readMessages(value: unknown): Incoming[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 12) return null;
  const messages: Incoming[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;
    const trimmed = content.trim().slice(0, 4000);
    if (!trimmed) return null;
    messages.push({ role, content: trimmed });
  }
  const total = messages.reduce((sum, message) => sum + message.content.length, 0);
  if (total > 14000) return null;
  if (messages[messages.length - 1]?.role !== "user") return null;
  return messages;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let raw = "";
        try {
          raw = await request.text();
        } catch {
          return Response.json({ error: "Couldn't read that message." }, { status: 400 });
        }
        if (raw.length > 80_000) {
          return Response.json({ error: "That message is too long." }, { status: 413 });
        }

        let body: unknown;
        try {
          body = JSON.parse(raw);
        } catch {
          return Response.json({ error: "Couldn't read that message." }, { status: 400 });
        }

        const mode = isMode((body as { mode?: unknown }).mode)
          ? (body as { mode: ModeId }).mode
          : null;
        const tone = isTone((body as { tone?: unknown }).tone)
          ? (body as { tone: ToneId }).tone
          : "clear";
        const messages = readMessages((body as { messages?: unknown }).messages);
        if (!mode || !messages) {
          return Response.json({ error: "Send a message first." }, { status: 400 });
        }

        if (!allowed(clientKey(request))) {
          return Response.json(
            { error: "You're going a little fast. Wait a minute and try again." },
            { status: 429 },
          );
        }

        const apiKey = process.env.XAI_API_KEY;
        if (!apiKey) {
          return Response.json(
            { error: "AI isn't available right now." },
            { status: 503 },
          );
        }

        let upstream: Response;
        try {
          upstream = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            signal: AbortSignal.any([request.signal, AbortSignal.timeout(45_000)]),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "grok-4.5",
              stream: true,
              max_tokens: 520,
              temperature: mode === "ask" || mode === "plan" ? 0.6 : 0.4,
              messages: [
                { role: "system", content: systemPrompt(mode, tone) },
                ...messages,
              ],
            }),
          });
        } catch {
          return Response.json(
            { error: "The model didn't answer. Try again." },
            { status: 502 },
          );
        }

        if (!upstream.ok || !upstream.body) {
          return replyFromUpstreamFailure(upstream);
        }

        const contentType = upstream.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          const payload = (await upstream.json()) as {
            choices?: { message?: { content?: string } }[];
          };
          const text = payload.choices?.[0]?.message?.content ?? "";
          return new Response(text, {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        const reader = upstream.body.getReader();
        let buffer = "";

        const enqueueLine = (
          controller: ReadableStreamDefaultController<Uint8Array>,
          line: string,
        ) => {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) return;
          const data = trimmed.slice(5).trim();
          if (!data || data === "[DONE]") return;
          try {
            const json = JSON.parse(data) as {
              choices?: { delta?: { content?: string } }[];
            };
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          } catch {
            // Incomplete JSON is kept in the buffer by the caller.
          }
        };

        const consume = (controller: ReadableStreamDefaultController<Uint8Array>, chunk: string) => {
          buffer += chunk;
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) enqueueLine(controller, line);
        };

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  buffer += decoder.decode();
                  if (buffer) enqueueLine(controller, buffer);
                  controller.close();
                  return;
                }
                consume(controller, decoder.decode(value, { stream: true }));
              }
            } catch (error) {
              controller.error(error);
            }
          },
          cancel() {
            void reader.cancel();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
