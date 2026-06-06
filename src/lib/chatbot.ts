import { intents, type Intent } from "@/data/chatbot-knowledge";

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text).split(/\s+/).filter(Boolean);
}

function matchIntent(message: string, locale: string): Intent {
  const tokens = tokenize(message);
  if (tokens.length === 0) return getDefault(locale);

  let best: Intent | null = null;
  let bestScore = 0;

  for (const intent of intents) {
    if (intent.id === "default") continue;
    const keywords = locale === "ar" ? intent.keywordsAr : intent.keywords;
    let score = 0;
    for (const kw of keywords) {
      const kwTokens = tokenize(kw);
      for (const token of tokens) {
        if (kwTokens.some((kt) => token.includes(kt) || kt.includes(token))) {
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

function getDefault(locale: string): Intent {
  const def = intents.find((i) => i.id === "default")!;
  return def;
}

export function getResponse(message: string, locale: string): {
  response: string;
  suggestions: string[];
} {
  const intent = matchIntent(message, locale);
  return {
    response: locale === "ar" ? intent.responseAr : intent.response,
    suggestions: locale === "ar" ? intent.suggestionsAr ?? [] : intent.suggestions ?? [],
  };
}
