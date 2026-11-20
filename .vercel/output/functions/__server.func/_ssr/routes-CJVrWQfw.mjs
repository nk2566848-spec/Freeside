import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Plus, c as Check, i as Square, l as ArrowUp, o as Menu, r as Trash2, s as Copy, t as X } from "../_libs/lucide-react.mjs";
import { a as previewPathPrefix, i as TONES, n as MODES, r as STARTERS } from "./router-DkO5AYJl.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CJVrWQfw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function renderInline(text) {
	return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
		if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
			className: "font-medium",
			children: part.slice(2, -2)
		}, index);
		if (part.startsWith("`") && part.endsWith("`") && part.length > 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
			className: "rounded-sm bg-subtle px-1 font-mono",
			children: part.slice(1, -1)
		}, index);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: part }, index);
	});
}
function Prose({ text }) {
	const lines = text.replace(/\n$/, "").split("\n");
	const blocks = [];
	let list = null;
	function flush() {
		if (!list) return;
		const items = list.items;
		const type = list.type;
		blocks.push(type === "ul" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "list-disc space-y-1 pl-5",
			children: items.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: renderInline(item) }, index))
		}, blocks.length) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "list-decimal space-y-1 pl-5",
			children: items.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: renderInline(item) }, index))
		}, blocks.length));
		list = null;
	}
	for (const line of lines) {
		const bullet = /^(?:[-*])\s+(.*)/.exec(line);
		const numbered = /^\d+[.)]\s+(.*)/.exec(line);
		if (bullet) {
			if (list?.type !== "ul") {
				flush();
				list = {
					type: "ul",
					items: []
				};
			}
			list.items.push(bullet[1] ?? "");
			continue;
		}
		if (numbered) {
			if (list?.type !== "ol") {
				flush();
				list = {
					type: "ol",
					items: []
				};
			}
			list.items.push(numbered[1] ?? "");
			continue;
		}
		flush();
		if (!line.trim()) continue;
		blocks.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-pretty",
			children: renderInline(line)
		}, blocks.length));
	}
	flush();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		children: blocks
	});
}
function MarkdownLite({ text }) {
	const pieces = text.split("```");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3 text-base leading-relaxed",
		children: pieces.map((piece, index) => {
			if (index % 2 === 1) {
				const newline = piece.indexOf("\n");
				const code = newline === -1 ? piece : piece.slice(newline + 1);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "overflow-x-auto rounded-lg bg-subtle p-3 font-mono text-sm leading-relaxed",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: code.replace(/\n$/, "") })
				}, index);
			}
			if (!piece.trim()) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Prose, { text: piece }, index);
		})
	});
}
function apiUrl(path) {
	if (typeof window === "undefined") return path;
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
	return prefix ? `${prefix}${path}` : path;
}
var useThreads = create()(persist((set) => ({
	threads: [],
	activeId: null,
	hydrated: false,
	setHydrated: (value) => set({ hydrated: value }),
	setActive: (id) => set({ activeId: id }),
	createThread: (mode, tone) => {
		const id = crypto.randomUUID();
		const thread = {
			id,
			title: "New chat",
			mode,
			tone,
			messages: [],
			updatedAt: Date.now()
		};
		set((state) => ({
			threads: [thread, ...state.threads].slice(0, 40),
			activeId: id
		}));
		return id;
	},
	setMode: (threadId, mode) => set((state) => ({ threads: state.threads.map((thread) => thread.id === threadId ? {
		...thread,
		mode
	} : thread) })),
	setTone: (threadId, tone) => set((state) => ({ threads: state.threads.map((thread) => thread.id === threadId ? {
		...thread,
		tone
	} : thread) })),
	pushMessage: (threadId, message) => set((state) => ({ threads: state.threads.map((thread) => {
		if (thread.id !== threadId) return thread;
		const title = thread.title === "New chat" && message.role === "user" ? message.content.replace(/\s+/g, " ").trim().slice(0, 48) : thread.title;
		return {
			...thread,
			title: title || "New chat",
			messages: [...thread.messages, message],
			updatedAt: Date.now()
		};
	}) })),
	updateMessage: (threadId, messageId, content) => set((state) => ({ threads: state.threads.map((thread) => thread.id === threadId ? {
		...thread,
		messages: thread.messages.map((message) => message.id === messageId ? {
			...message,
			content
		} : message)
	} : thread) })),
	dropMessage: (threadId, messageId) => set((state) => ({ threads: state.threads.map((thread) => thread.id === threadId ? {
		...thread,
		messages: thread.messages.filter((message) => message.id !== messageId)
	} : thread) })),
	removeThread: (id) => set((state) => ({
		threads: state.threads.filter((thread) => thread.id !== id),
		activeId: state.activeId === id ? null : state.activeId
	}))
}), {
	name: "freeside.v1",
	skipHydration: true,
	partialize: (state) => ({
		threads: state.threads,
		activeId: state.activeId
	})
}));
function formatWhen(stamp) {
	const minutes = Math.round((Date.now() - stamp) / 6e4);
	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes}m`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours}h`;
	const days = Math.round(hours / 24);
	if (days < 7) return `${days}d`;
	return new Date(stamp).toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	});
}
function CopyButton({ text }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: "grid h-11 w-11 place-items-center rounded-full text-faint hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
		"aria-label": copied ? "Copied" : "Copy reply",
		onClick: () => {
			navigator.clipboard.writeText(text).then(() => {
				setCopied(true);
				window.setTimeout(() => setCopied(false), 1400);
			});
		},
		children: copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" })
	});
}
function ThreadList({ onPick }) {
	const threads = useThreads((state) => state.threads);
	const activeId = useThreads((state) => state.activeId);
	const setActive = useThreads((state) => state.setActive);
	const removeThread = useThreads((state) => state.removeThread);
	const ordered = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-between px-4 pb-3 pt-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-3xl leading-none text-fg",
					children: "Freeside"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Free to use"
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-3 pb-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex h-11 w-full items-center gap-2 rounded-lg border border-line px-3 text-sm font-medium text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
					onClick: () => {
						setActive(null);
						onPick?.();
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "New chat"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-y-auto px-2 pb-4",
				children: ordered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-2 py-6 text-sm text-faint",
					children: "No chats yet."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col",
					children: ordered.map((thread) => {
						const selected = thread.id === activeId;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: `min-h-11 min-w-0 flex-1 truncate rounded-lg px-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${selected ? "bg-subtle text-fg" : "text-muted"}`,
								onClick: () => {
									setActive(thread.id);
									onPick?.();
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate",
									children: thread.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-faint tabular-nums",
									children: formatWhen(thread.updatedAt)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid h-11 w-11 shrink-0 place-items-center rounded-full text-faint hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
								"aria-label": `Delete ${thread.title}`,
								onClick: () => removeThread(thread.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})]
						}, thread.id);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "border-t border-line px-4 py-4 text-xs text-faint",
				children: "No account. Chats stay on this device. Runs on Grok."
			})
		]
	});
}
function FreesideApp() {
	const threads = useThreads((state) => state.threads);
	const activeId = useThreads((state) => state.activeId);
	const active = threads.find((thread) => thread.id === activeId) ?? null;
	const [draftMode, setDraftMode] = (0, import_react.useState)("ask");
	const [draftTone, setDraftTone] = (0, import_react.useState)("clear");
	const [input, setInput] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [streamingId, setStreamingId] = (0, import_react.useState)(null);
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	const boxRef = (0, import_react.useRef)(null);
	const endRef = (0, import_react.useRef)(null);
	const abortRef = (0, import_react.useRef)(null);
	const busyRef = (0, import_react.useRef)(false);
	const mode = active?.mode ?? draftMode;
	const tone = active?.tone ?? draftTone;
	const modeMeta = MODES.find((item) => item.id === mode) ?? MODES[0];
	const streaming = streamingId !== null;
	(0, import_react.useEffect)(() => {
		Promise.resolve(useThreads.persist.rehydrate()).finally(() => {
			useThreads.getState().setHydrated(true);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		endRef.current?.scrollIntoView({ block: "end" });
	}, [active?.messages, streamingId]);
	(0, import_react.useEffect)(() => {
		if (!menuOpen) return;
		function onKey(event) {
			if (event.key === "Escape") setMenuOpen(false);
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [menuOpen]);
	function chooseMode(next) {
		if (active) useThreads.getState().setMode(active.id, next);
		else setDraftMode(next);
	}
	function chooseTone(next) {
		if (active) useThreads.getState().setTone(active.id, next);
		else setDraftTone(next);
	}
	function resizeBox() {
		const box = boxRef.current;
		if (!box) return;
		box.style.height = "auto";
		box.style.height = `${Math.min(box.scrollHeight, 160)}px`;
	}
	async function run(threadId, history, assistantId) {
		const controller = new AbortController();
		abortRef.current = controller;
		setStreamingId(assistantId);
		setError(null);
		let full = "";
		let lastFlush = 0;
		const flush = (force) => {
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
					messages: history.filter((message) => message.content.trim()).slice(-12).map((message) => ({
						role: message.role,
						content: message.content
					}))
				})
			});
			const contentType = response.headers.get("content-type") ?? "";
			if (!response.ok || contentType.includes("application/json")) {
				const payload = await response.json().catch(() => null);
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
			if (caught instanceof Error && caught.name === "AbortError") {
				if (!full.trim()) useThreads.getState().dropMessage(threadId, assistantId);
				else useThreads.getState().updateMessage(threadId, assistantId, full.trim());
				return;
			}
			if (!full.trim()) useThreads.getState().dropMessage(threadId, assistantId);
			setError(caught instanceof Error ? caught.message : "The model didn't answer. Try again.");
		} finally {
			if (abortRef.current === controller) abortRef.current = null;
			setStreamingId((current) => current === assistantId ? null : current);
		}
	}
	function send(text) {
		const content = text.trim();
		if (!content || streaming || busyRef.current) return;
		if (content.length > 4e3) {
			setError("Keep it under 4,000 characters.");
			return;
		}
		busyRef.current = true;
		setError(null);
		(async () => {
			try {
				if (!useThreads.getState().hydrated) {
					await Promise.resolve(useThreads.persist.rehydrate());
					useThreads.getState().setHydrated(true);
				}
				const store = useThreads.getState();
				const current = store.threads.find((thread) => thread.id === store.activeId) ?? null;
				const threadId = current?.id ?? store.createThread(current?.mode ?? mode, current?.tone ?? tone);
				const history = current?.messages ?? [];
				const userMessage = {
					id: crypto.randomUUID(),
					role: "user",
					content
				};
				const assistantId = crypto.randomUUID();
				store.pushMessage(threadId, userMessage);
				store.pushMessage(threadId, {
					id: assistantId,
					role: "assistant",
					content: ""
				});
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
			content: ""
		});
		setError(null);
		run(active.id, history, assistantId);
	}
	function stop() {
		abortRef.current?.abort();
	}
	const showHero = !active || active.messages.length === 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "hidden h-full w-72 shrink-0 flex-col overflow-hidden border-r border-line bg-elevated md:flex",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadList, {})
			}),
			menuOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-30 md:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "absolute inset-0 bg-bg/80",
					"aria-label": "Close chats",
					onClick: () => setMenuOpen(false)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "drawer-in absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col border-r border-line bg-elevated",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end px-2 pt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid h-11 w-11 place-items-center rounded-full text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
							"aria-label": "Close chats",
							onClick: () => setMenuOpen(false),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThreadList, { onPick: () => setMenuOpen(false) })]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex h-14 items-center gap-1 border-b border-line px-2 md:px-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid h-11 w-11 place-items-center rounded-full text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden",
								"aria-label": "Open chats",
								onClick: () => setMenuOpen(true),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
							}),
							active && active.messages.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "min-w-0 flex-1 truncate text-sm font-medium",
								children: active.title
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-display text-2xl leading-none md:hidden",
									children: "Freeside"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "hidden truncate text-sm text-muted md:block",
									children: modeMeta.hint
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid h-11 w-11 place-items-center rounded-full text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
								"aria-label": "New chat",
								onClick: () => {
									useThreads.getState().setActive(null);
									setError(null);
									setInput("");
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5" })
							}),
							active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid h-11 w-11 place-items-center rounded-full text-faint hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
								"aria-label": "Delete chat",
								onClick: () => useThreads.getState().removeThread(active.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
						className: "min-h-0 min-w-0 flex-1 overflow-y-auto",
						children: [showHero ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rise mx-auto w-full max-w-2xl px-4 pb-8 pt-12 md:pt-20",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "font-display text-5xl leading-none text-balance text-fg",
									children: "Ask anything."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 max-w-md text-pretty text-base text-muted",
									children: "Questions, rewrites, summaries, and plans. No account, no paywall — and the conversation stays on this device."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-8 flex flex-col gap-2",
									children: STARTERS[mode].map((starter) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "w-full rounded-lg border border-line bg-elevated px-4 py-3 text-left text-sm leading-snug text-fg transition-colors duration-150 hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
										onClick: () => send(starter),
										children: starter
									}) }, starter))
								})
							]
						}) : null, active && active.messages.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6",
							children: [active.messages.map((message) => {
								const pending = message.id === streamingId && !message.content;
								if (message.role === "user") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "bubble-user",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mb-1 text-xs font-medium text-muted",
										children: "You"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "rounded-lg bg-subtle px-4 py-3 text-sm leading-relaxed text-pretty whitespace-pre-wrap",
										children: message.content
									})]
								}, message.id);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-1 flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium text-muted",
										children: "Freeside"
									}), message.content ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, { text: message.content }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-11" })]
								}), pending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-faint",
									children: "Writing…"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: message.id === streamingId ? "caret" : void 0,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarkdownLite, { text: message.content })
								})] }, message.id);
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: endRef })]
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
						className: "dock min-w-0 border-t border-line px-3 pt-3",
						children: [error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto mb-3 flex w-full max-w-2xl items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-danger",
								children: error
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "h-11 shrink-0 rounded-full border border-line px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
								onClick: retry,
								children: "Try again"
							})]
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto w-full max-w-2xl",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "chip-row pb-2",
									role: "radiogroup",
									"aria-label": "What kind of help",
									children: MODES.map((item) => {
										const selected = item.id === mode;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											role: "radio",
											"aria-checked": selected,
											className: `h-11 shrink-0 rounded-full px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${selected ? "bg-accent text-accent-fg" : "border border-line text-muted"}`,
											onClick: () => chooseMode(item.id),
											children: item.label
										}, item.id);
									})
								}),
								mode === "rewrite" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "chip-row pb-2",
									role: "radiogroup",
									"aria-label": "Rewrite tone",
									children: TONES.map((item) => {
										const selected = item.id === tone;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											role: "radio",
											"aria-checked": selected,
											className: `h-11 shrink-0 rounded-full px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${selected ? "bg-subtle text-fg" : "text-faint"}`,
											onClick: () => chooseTone(item.id),
											children: item.label
										}, item.id);
									})
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
									className: "composer rounded-xl border bg-elevated p-2",
									onSubmit: (event) => {
										event.preventDefault();
										if (streaming) return;
										send(input);
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-end gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												htmlFor: "composer",
												className: "sr-only",
												children: "Message"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
												id: "composer",
												ref: boxRef,
												rows: 1,
												value: input,
												placeholder: modeMeta.placeholder,
												disabled: streaming,
												className: "max-h-40 min-h-11 flex-1 resize-none bg-transparent px-2 py-3 text-base text-fg outline-none placeholder:text-faint disabled:opacity-60",
												onChange: (event) => {
													setInput(event.target.value);
													resizeBox();
												},
												onKeyDown: (event) => {
													if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
														event.preventDefault();
														if (!streaming) send(input);
													}
												}
											}),
											streaming ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-accent-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
												"aria-label": "Stop",
												onClick: stop,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-4" })
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "submit",
												className: "grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-accent-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40",
												"aria-label": "Send",
												disabled: streaming || !input.trim(),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-5" })
											})
										]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "px-1 pt-2 text-xs text-faint",
									children: "Replies stay short so this stays free."
								})
							]
						})]
					})
				]
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreesideApp, {});
}
//#endregion
export { Home as component };
