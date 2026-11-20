import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ModeId, ToneId } from "@/lib/modes";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export type Thread = {
  id: string;
  title: string;
  mode: ModeId;
  tone: ToneId;
  messages: ChatMessage[];
  updatedAt: number;
};

type ThreadsState = {
  threads: Thread[];
  activeId: string | null;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  setActive: (id: string | null) => void;
  createThread: (mode: ModeId, tone: ToneId) => string;
  setMode: (threadId: string, mode: ModeId) => void;
  setTone: (threadId: string, tone: ToneId) => void;
  pushMessage: (threadId: string, message: ChatMessage) => void;
  updateMessage: (threadId: string, messageId: string, content: string) => void;
  dropMessage: (threadId: string, messageId: string) => void;
  removeThread: (id: string) => void;
};

const STORAGE_KEY = "freeside.v1";

export const useThreads = create<ThreadsState>()(
  persist(
    (set) => ({
      threads: [],
      activeId: null,
      hydrated: false,
      setHydrated: (value) => set({ hydrated: value }),
      setActive: (id) => set({ activeId: id }),
      createThread: (mode, tone) => {
        const id = crypto.randomUUID();
        const thread: Thread = {
          id,
          title: "New chat",
          mode,
          tone,
          messages: [],
          updatedAt: Date.now(),
        };
        set((state) => ({
          threads: [thread, ...state.threads].slice(0, 40),
          activeId: id,
        }));
        return id;
      },
      setMode: (threadId, mode) =>
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === threadId ? { ...thread, mode } : thread,
          ),
        })),
      setTone: (threadId, tone) =>
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === threadId ? { ...thread, tone } : thread,
          ),
        })),
      pushMessage: (threadId, message) =>
        set((state) => ({
          threads: state.threads.map((thread) => {
            if (thread.id !== threadId) return thread;
            const title =
              thread.title === "New chat" && message.role === "user"
                ? message.content.replace(/\s+/g, " ").trim().slice(0, 48)
                : thread.title;
            return {
              ...thread,
              title: title || "New chat",
              messages: [...thread.messages, message],
              updatedAt: Date.now(),
            };
          }),
        })),
      updateMessage: (threadId, messageId, content) =>
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  messages: thread.messages.map((message) =>
                    message.id === messageId ? { ...message, content } : message,
                  ),
                }
              : thread,
          ),
        })),
      dropMessage: (threadId, messageId) =>
        set((state) => ({
          threads: state.threads.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  messages: thread.messages.filter((message) => message.id !== messageId),
                }
              : thread,
          ),
        })),
      removeThread: (id) =>
        set((state) => ({
          threads: state.threads.filter((thread) => thread.id !== id),
          activeId: state.activeId === id ? null : state.activeId,
        })),
    }),
    {
      name: STORAGE_KEY,
      skipHydration: true,
      partialize: (state) => ({
        threads: state.threads,
        activeId: state.activeId,
      }),
    },
  ),
);
