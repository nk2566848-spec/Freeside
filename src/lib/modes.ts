export const MODES = [
  {
    id: "ask",
    label: "Ask",
    placeholder: "Ask a question",
    hint: "Straight answers",
  },
  {
    id: "rewrite",
    label: "Rewrite",
    placeholder: "Paste text to rewrite",
    hint: "Same meaning, better words",
  },
  {
    id: "summarize",
    label: "Summarize",
    placeholder: "Paste something long",
    hint: "The short version",
  },
  {
    id: "explain",
    label: "Explain",
    placeholder: "What should I explain?",
    hint: "Plain language",
  },
  {
    id: "plan",
    label: "Plan",
    placeholder: "What do you need a plan for?",
    hint: "Steps you can follow",
  },
] as const;

export const TONES = [
  { id: "clear", label: "Clearer" },
  { id: "short", label: "Shorter" },
  { id: "warm", label: "Warmer" },
  { id: "sharp", label: "Sharper" },
  { id: "formal", label: "Formal" },
] as const;

export type ModeId = (typeof MODES)[number]["id"];
export type ToneId = (typeof TONES)[number]["id"];

export function isMode(value: unknown): value is ModeId {
  return MODES.some((mode) => mode.id === value);
}

export function isTone(value: unknown): value is ToneId {
  return TONES.some((tone) => tone.id === value);
}

export const STARTERS: Record<ModeId, string[]> = {
  ask: [
    "What can I cook tonight with rice, eggs, and onions?",
    "How does credit-card interest actually get charged?",
    "Help me say no to a plan without sounding cold.",
  ],
  rewrite: [
    "hey are you free tomorrow after 6? need to talk about the group project, it's kind of urgent",
    "I wanted to follow up on my application and see if there are any updates regarding the status of it.",
  ],
  summarize: [
    "The launch slips to Thursday. Payments still fail on older phones, Priya is patching tonight, and we haven't picked a price. Next check-in is Wednesday at 9.",
  ],
  explain: [
    "Explain DNS like I've never seen how the internet finds a website.",
    "What is an insurance deductible, in normal words?",
  ],
  plan: [
    "Plan a 30-minute weeknight reset for a messy kitchen.",
    "I have a job interview Friday. Make me a two-day prep plan.",
  ],
};
