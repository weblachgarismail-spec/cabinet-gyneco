import { intents, type Intent } from "@/data/chatbot-knowledge";

export type ChatContext = { lastIntentId: string | null };

const DETAILS_MAP: Record<string, string> = {
  echo: "echo_details",
  pregnancy_followup: "pregnancy_followup_details",
  screening: "screening_details",
  contraception: "contraception_details",
  menopause: "menopause_details",
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\sa-z0-9\u0600-\u06FF]/g, "")
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text).split(/\s+/).filter(Boolean);
}

function stem(word: string): string {
  let w = word;
  if (w.length > 5) {
    if (w.endsWith("ment")) w = w.slice(0, -4);
    else if (w.endsWith("tion") || w.endsWith("sion")) w = w.slice(0, -4);
    else if (w.endsWith("eur")) w = w.slice(0, -3);
    else if (w.endsWith("euse")) w = w.slice(0, -4);
    else if (w.endsWith("age")) w = w.slice(0, -3);
  }
  if (w.length > 3) {
    if (w.endsWith("s") || w.endsWith("z") || w.endsWith("e")) w = w.slice(0, -1);
  }
  return w;
}

function isFollowUp(message: string, lastIntentId: string | null): boolean {
  if (!lastIntentId) return false;
  const tokens = tokenize(message);
  if (tokens.length > 3) return false;
  const followUpWords = ["plus", "encore", "details", "détails", "oui", "ok", "d'accord", "info", "davantage", "autre", "autres", "exactement", "bien", "préciser", "complément"];
  return tokens.some((t) => followUpWords.some((fw) => fw.includes(t)));
}

function getDefault(locale: string): Intent {
  return intents.find((i) => i.id === "default")!;
}

function matchIntent(message: string, locale: string, lastIntentId: string | null): Intent {
  if (lastIntentId && isFollowUp(message, lastIntentId)) {
    const detailId = DETAILS_MAP[lastIntentId];
    if (detailId) {
      const detail = intents.find((i) => i.id === detailId);
      if (detail) return detail;
    }
    const last = intents.find((i) => i.id === lastIntentId);
    if (last) return last;
  }

  const tokens = tokenize(message).map(stem);
  if (tokens.length === 0) return getDefault(locale);

  let best: Intent | null = null;
  let bestScore = 0;

  for (const intent of intents) {
    if (intent.id === "default") continue;
    const keywords = locale === "ar" ? intent.keywordsAr : intent.keywords;
    let score = 0;
    for (const kw of keywords) {
      const kwTokens = tokenize(kw).map(stem);
      for (const t of tokens) {
        if (kwTokens.some((kt) => t.includes(kt) || kt.includes(t))) {
          score++;
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }

  if (best && bestScore > 0) return best;
  return getDefault(locale);
}

export function getResponse(
  message: string,
  locale: string,
  context?: ChatContext,
): { response: string; suggestions: string[]; context: ChatContext } {
  const lastIntentId = context?.lastIntentId ?? null;
  const intent = matchIntent(message, locale, lastIntentId);
  return {
    response: locale === "ar" ? intent.responseAr : intent.response,
    suggestions: locale === "ar" ? intent.suggestionsAr ?? [] : intent.suggestions ?? [],
    context: { lastIntentId: intent.id },
  };
}
