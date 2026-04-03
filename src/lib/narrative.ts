import { RabbitHoleArticle } from "./types";

export interface RabbitHoleNarrative {
  pullQuote: string;
  summary: string;
  steps: { title: string; connection: string }[];
}

function stripParenthetical(s: string): string {
  return s.replace(/\s*\(.*?\)\s*/g, "").trim();
}

function descriptionOrTitle(article: RabbitHoleArticle): string {
  if (article.description) {
    const desc = article.description.toLowerCase();
    if (desc.length < 60) return desc;
    return desc.slice(0, 57) + "...";
  }
  return stripParenthetical(article.title).toLowerCase();
}

/**
 * Extracts the first sentence from a text block.
 */
function firstSentence(text: string): string {
  const match = text.match(/^.+?[.!?](?:\s|$)/);
  return match ? match[0].trim() : text.slice(0, 120).trim();
}

const BRIDGES = [
  (a: string, b: string) => `${a} — which brings us to ${b}`,
  (a: string, b: string) => `${a} This connects to a different thread: ${b}`,
  (a: string, b: string) => `Starting from the fact that ${a.charAt(0).toLowerCase() + a.slice(1)} Meanwhile, ${b.charAt(0).toLowerCase() + b.slice(1)}`,
];

/**
 * Builds a connection description from available data, in priority order:
 * 1. Real Wikipedia link context (the paragraph where the link lives)
 * 2. Extract-based first sentences woven with a varied bridge phrase
 */
function buildConnection(
  from: RabbitHoleArticle,
  to: RabbitHoleArticle,
  linkContext: string | null,
  index: number
): string {
  if (linkContext) {
    return linkContext;
  }

  const fromSentence = firstSentence(from.extract);
  const toSentence = firstSentence(to.extract);
  const bridge = BRIDGES[index % BRIDGES.length];
  return bridge(fromSentence, toSentence);
}

const OPENERS = [
  "How",
  "The unexpected link between",
  "What",
  "The surprising path from",
];

export function generateNarrative(
  articles: RabbitHoleArticle[],
  linkContexts?: (string | null)[]
): RabbitHoleNarrative {
  if (articles.length < 2) {
    return {
      pullQuote: articles[0]?.title || "",
      summary: "",
      steps: [],
    };
  }

  const first = articles[0];
  const last = articles[articles.length - 1];
  const firstDesc = descriptionOrTitle(first);
  const lastDesc = descriptionOrTitle(last);

  const openerIdx = Math.floor(
    Math.abs(Math.sin(first.title.length * 7)) * OPENERS.length
  );
  const opener = OPENERS[openerIdx];

  let pullQuote: string;
  switch (openerIdx) {
    case 0:
      pullQuote = `${opener} ${firstDesc} led to ${lastDesc}`;
      break;
    case 1:
      pullQuote = `${opener} ${firstDesc} and ${lastDesc}`;
      break;
    case 2:
      pullQuote = `${opener} ${firstDesc} has to do with ${lastDesc}`;
      break;
    default:
      pullQuote = `${opener} ${firstDesc} to ${lastDesc}`;
  }

  const steps = articles.map((article, i) => {
    let connection = "";
    if (i < articles.length - 1) {
      const ctx = linkContexts?.[i] ?? null;
      connection = buildConnection(article, articles[i + 1], ctx, i);
    }
    return { title: article.title, connection };
  });

  const bestContext = linkContexts?.find((c) => c && c.length > 40) ?? null;
  const middleNames = articles
    .slice(1, -1)
    .map((a) => stripParenthetical(a.title));
  const through =
    middleNames.length > 0
      ? `, passing through ${middleNames.join(", ")}`
      : "";

  const summaryBase = `This rabbit hole takes you from "${stripParenthetical(first.title)}" to "${stripParenthetical(last.title)}"${through}.`;
  const summaryDetail = bestContext
    ? ` ${firstSentence(bestContext)}`
    : "";

  return {
    pullQuote,
    summary: summaryBase + summaryDetail,
    steps,
  };
}
