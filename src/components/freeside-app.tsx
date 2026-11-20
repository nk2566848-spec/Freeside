import { useEffect, useRef, useState } from "react";
import { ArrowUp, Check, Copy, Menu, Plus, Square, Trash2, X } from "lucide-react";
import { MarkdownLite } from "@/components/markdown-lite";
import { apiUrl } from "@/lib/api-url";
import { MODES, STARTERS, TONES, type ModeId, type ToneId } from "@/lib/modes";
import { useThreads, type ChatMessage } from "@/lib/threads";

function formatWhen(stamp: number): string {
  const minutes = Math.round((Date.now() - stamp) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(stamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="grid h-11 w-11 place-items-center rounded-full text-faint hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      aria-label={copied ? "Copied" : "Copy reply"}
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1400);
        });
      }}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  );
}

function ThreadList({ onPick }: { onPick?: () => void }) {
  const threads = useThreads((state) => state.threads);
  const activeId = useThreads((state) => state.activeId);
  const setActive = useThreads((state) => state.setActive);
  const removeThread = useThreads((state) => state.removeThread);
  const ordered = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-4 pb-3 pt-5">
        <div>
          <p className="font-display text-3xl leading-none text-fg">Freeside</p>
          <p className="mt-2 text-sm text-muted">Free to use</p>
        </div>
      </div>
      <div className="px-3 pb-3">
        <button
          type="button"
          className="flex h-11 w-full items-center gap-2 rounded-lg border border-line px-3 text-sm font-medium text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          onClick={() => {
            setActive(null);
            onPick?.();
          }}
        >
          <Plus className="size-4" />
          New chat
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {ordered.length === 0 ? (
          <p className="px-2 py-6 text-sm text-faint">No chats yet.</p>
        ) : (
          <ul className="flex flex-col">
            {ordered.map((thread) => {
              const selected = thread.id === activeId;
              return (
                <li key={thread.id} className="flex items-center">
                  <button
                    type="button"
                    className={`min-h-11 min-w-0 flex-1 truncate rounded-lg px-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      selected ? "bg-subtle text-fg" : "text-muted"
                    }`}
                    onClick={() => {
                      setActive(thread.id);
                      onPick?.();
                    }}
                  >
                    <span className="block truncate">{thread.title}</span>
                    <span className="text-xs text-faint tabular-nums">{formatWhen(thread.updatedAt)}</span>
                  </button>
                  <button
                    type="button"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-faint hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    aria-label={`Delete ${thread.title}`}
                    onClick={() => removeThread(thread.id)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <p className="border-t border-line px-4 py-4 text-xs text-faint">
        No account. Chats stay on this device. Runs on Grok.
      </p>
    </div>
  );
}

export function FreesideApp() {
  const threads = useThreads((state) => state.threads);
  const activeId = useThreads((state) => state.activeId);
  const active = threads.find((thread) => thread.id === activeId) ?? null;

  const [draftMode, setDraftMode] = useState<ModeId>("ask");
  const [draftTone, setDraftTone] = useState<ToneId>("clear");
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const boxRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const busyRef = useRef(false);

  const mode = active?.mode ?? draftMode;
  const tone = active?.tone ?? draftTone;
  const modeMeta = MODES.find((item) => item.id === mode) ?? MODES[0];
  const streaming = streamingId !== null;

  useEffect(() => {
    void Promise.resolve(useThreads.persist.rehydrate()).finally(() => {
      useThreads.getState().setHydrated(true);
    });
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [active?.messages, streamingId]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  function chooseMode(next: ModeId) {
    if (active) useThreads.getState().setMode(active.id, next);
    else setDraftMode(next);
  }

  function chooseTone(next: ToneId) {
    if (active) useThreads.getState().setTone(active.id, next);
    else setDraftTone(next);
  }

  function resizeBox() {
    const box = boxRef.current;
    if (!box) return;
    box.style.height = "auto";
    box.style.height = `${Math.min(box.scrollHeight, 160)}px`;
  }

  async function run(threadId: string, history: ChatMessage[], assistantId: string) {
    const controller = new AbortController();
    abortRef.current = controller;
    setStreamingId(assistantId);
    setError(null);
    let full = "";
    let lastFlush = 0;

    const flush = (force: boolean) => {
      const now = Date.now();
      if (!force && now - lastFlush < 80) return;
      lastFlush = now;
      useThreads.getState().updateMessage(threadId, assistantId, full);
    };

    try {
      const response = await fetch(apiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          mode: useThreads.getState().threads.find((thread) => thread.id === threadId)?.mode ?? mode,
          tone: useThreads.getState().threads.find((thread) => thread.id === threadId)?.tone ?? tone,
          messages: history
            .filter((message) => message.content.trim())
            .slice(-12)
            .map((message) => ({ role: message.role, content: message.content })),
        }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      if (!response.ok || contentType.includes("application/json")) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "The model didn't answer. Try again.");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("The model didn't answer. Try again.");
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        flush(false);
      }
      full += decoder.decode();
      full = full.trim();
      if (!full) throw new Error("The model didn't answer. Try again.");
      useThreads.getState().updateMessage(threadId, assistantId, full);
    } catch (caught) {
      const aborted = caught instanceof Error && caught.name === "AbortError";
      if (aborted) {
        if (!full.trim()) useThreads.getState().dropMessage(threadId, assistantId);
        else useThreads.getState().updateMessage(threadId, assistantId, full.trim());
        return;
      }
      if (!full.trim()) useThreads.getState().dropMessage(threadId, assistantId);
      setError(caught instanceof Error ? caught.message : "The model didn't answer. Try again.");
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setStreamingId((current) => (current === assistantId ? null : current));
    }
  }

  function send(text: string) {
    const content = text.trim();
    if (!content || streaming || busyRef.current) return;
    if (content.length > 4000) {
      setError("Keep it under 4,000 characters.");
      return;
    }
    busyRef.current = true;
    setError(null);
    void (async () => {
      try {
        if (!useThreads.getState().hydrated) {
          await Promise.resolve(useThreads.persist.rehydrate());
          useThreads.getState().setHydrated(true);
        }
        const store = useThreads.getState();
        const current = store.threads.find((thread) => thread.id === store.activeId) ?? null;
        const threadId = current?.id ?? store.createThread(current?.mode ?? mode, current?.tone ?? tone);
        const history = current?.messages ?? [];
        const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content };
        const assistantId = crypto.randomUUID();
        store.pushMessage(threadId, userMessage);
        store.pushMessage(threadId, { id: assistantId, role: "assistant", content: "" });
        setInput("");
        if (boxRef.current) boxRef.current.style.height = "auto";
        await run(threadId, [...history, userMessage], assistantId);
      } finally {
        busyRef.current = false;
      }
    })();
  }

  function retry() {
    if (!active || streaming) return;
    const history = active.messages.filter((message) => message.content.trim());
    if (history.length === 0 || history[history.length - 1]?.role !== "user") return;
    const assistantId = crypto.randomUUID();
    useThreads.getState().pushMessage(active.id, {
      id: assistantId,
      role: "assistant",
      content: "",
    });
    setError(null);
    void run(active.id, history, assistantId);
  }

  function stop() {
    abortRef.current?.abort();
  }

  const showHero = !active || active.messages.length === 0;

  return (
    <div className="flex h-dvh overflow-hidden bg-bg text-fg">
      <aside className="hidden h-full w-72 shrink-0 flex-col overflow-hidden border-r border-line bg-elevated md:flex">
        <ThreadList />
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-30 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-bg/80"
            aria-label="Close chats"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="drawer-in absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col border-r border-line bg-elevated">
            <div className="flex justify-end px-2 pt-2">
              <button
                type="button"
                className="grid h-11 w-11 place-items-center rounded-full text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                aria-label="Close chats"
                onClick={() => setMenuOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>
            <ThreadList onPick={() => setMenuOpen(false)} />
          </aside>
        </div>
      ) : null}

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-1 border-b border-line px-2 md:px-4">
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden"
            aria-label="Open chats"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-5" />
          </button>
          {active && active.messages.length > 0 ? (
            <h1 className="min-w-0 flex-1 truncate text-sm font-medium">{active.title}</h1>
          ) : (
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-2xl leading-none md:hidden">Freeside</p>
              <p className="hidden truncate text-sm text-muted md:block">{modeMeta.hint}</p>
            </div>
          )}
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label="New chat"
            onClick={() => {
              useThreads.getState().setActive(null);
              setError(null);
              setInput("");
            }}
          >
            <Plus className="size-5" />
          </button>
          {active ? (
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full text-faint hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              aria-label="Delete chat"
              onClick={() => useThreads.getState().removeThread(active.id)}
            >
              <Trash2 className="size-4" />
            </button>
          ) : null}
        </header>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          {showHero ? (
            <div className="rise mx-auto w-full max-w-2xl px-4 pb-8 pt-12 md:pt-20">
              <h1 className="font-display text-5xl leading-none text-balance text-fg">Ask anything.</h1>
              <p className="mt-4 max-w-md text-pretty text-base text-muted">
                Questions, rewrites, summaries, and plans. No account, no paywall — and the
                conversation stays on this device.
              </p>
              <ul className="mt-8 flex flex-col gap-2">
                {STARTERS[mode].map((starter) => (
                  <li key={starter}>
                    <button
                      type="button"
                      className="w-full rounded-lg border border-line bg-elevated px-4 py-3 text-left text-sm leading-snug text-fg transition-colors duration-150 hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      onClick={() => send(starter)}
                    >
                      {starter}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {active && active.messages.length > 0 ? (
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6">
              {active.messages.map((message) => {
                const pending = message.id === streamingId && !message.content;
                if (message.role === "user") {
                  return (
                    <article key={message.id} className="bubble-user">
                      <p className="mb-1 text-xs font-medium text-muted">You</p>
                      <div className="rounded-lg bg-subtle px-4 py-3 text-sm leading-relaxed text-pretty whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </article>
                  );
                }
                return (
                  <article key={message.id}>
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-xs font-medium text-muted">Freeside</p>
                      {message.content ? <CopyButton text={message.content} /> : <span className="h-11" />}
                    </div>
                    {pending ? (
                      <p className="text-sm text-faint">Writing…</p>
                    ) : (
                      <div className={message.id === streamingId ? "caret" : undefined}>
                        <MarkdownLite text={message.content} />
                      </div>
                    )}
                  </article>
                );
              })}
              <div ref={endRef} />
            </div>
          ) : null}
        </main>

        <footer className="dock min-w-0 border-t border-line px-3 pt-3">
          {error ? (
            <div className="mx-auto mb-3 flex w-full max-w-2xl items-center justify-between gap-3">
              <p className="text-sm text-danger">{error}</p>
              <button
                type="button"
                className="h-11 shrink-0 rounded-full border border-line px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                onClick={retry}
              >
                Try again
              </button>
            </div>
          ) : null}

          <div className="mx-auto w-full max-w-2xl">
            <div className="chip-row pb-2" role="radiogroup" aria-label="What kind of help">
              {MODES.map((item) => {
                const selected = item.id === mode;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`h-11 shrink-0 rounded-full px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      selected ? "bg-accent text-accent-fg" : "border border-line text-muted"
                    }`}
                    onClick={() => chooseMode(item.id)}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {mode === "rewrite" ? (
              <div className="chip-row pb-2" role="radiogroup" aria-label="Rewrite tone">
                {TONES.map((item) => {
                  const selected = item.id === tone;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={`h-11 shrink-0 rounded-full px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                        selected ? "bg-subtle text-fg" : "text-faint"
                      }`}
                      onClick={() => chooseTone(item.id)}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ) : null}

            <form
              className="composer rounded-xl border bg-elevated p-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (streaming) return;
                send(input);
              }}
            >
              <div className="flex items-end gap-2">
                <label htmlFor="composer" className="sr-only">
                  Message
                </label>
                <textarea
                  id="composer"
                  ref={boxRef}
                  rows={1}
                  value={input}
                  placeholder={modeMeta.placeholder}
                  disabled={streaming}
                  className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-2 py-3 text-base text-fg outline-none placeholder:text-faint disabled:opacity-60"
                  onChange={(event) => {
                    setInput(event.target.value);
                    resizeBox();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                      event.preventDefault();
                      if (!streaming) send(input);
                    }
                  }}
                />
                {streaming ? (
                  <button
                    type="button"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-accent-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    aria-label="Stop"
                    onClick={stop}
                  >
                    <Square className="size-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-accent-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40"
                    aria-label="Send"
                    disabled={streaming || !input.trim()}
                  >
                    <ArrowUp className="size-5" />
                  </button>
                )}
              </div>
            </form>
            <p className="px-1 pt-2 text-xs text-faint">Replies stay short so this stays free.</p>
          </div>
        </footer>
      </section>
    </div>
  );
}
