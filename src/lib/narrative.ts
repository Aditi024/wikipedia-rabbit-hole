import { RabbitHoleArticle } from "./types";

export interface RabbitHoleNarrative {
  pullQuote: string;
  summary: string;
  steps: { title: string; segue: string; connection: string }[];
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
 * Extracts significant words from text (excluding common stopwords).
 */
function significantWords(text: string): Set<string> {
  const stop = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "need", "dare", "ought",
    "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
    "as", "into", "through", "during", "before", "after", "above",
    "below", "between", "out", "off", "over", "under", "again",
    "further", "then", "once", "and", "but", "or", "nor", "not", "so",
    "yet", "both", "either", "neither", "each", "every", "all", "any",
    "few", "more", "most", "other", "some", "such", "no", "only", "own",
    "same", "than", "too", "very", "just", "because", "until", "while",
    "about", "against", "this", "that", "these", "those", "it", "its",
    "he", "she", "they", "them", "his", "her", "their", "we", "you",
    "i", "me", "my", "your", "our", "who", "whom", "which", "what",
    "when", "where", "how", "also", "well", "one", "two", "first",
    "new", "now", "way", "many", "much", "even", "back", "there",
    "here", "still", "since", "long", "make", "like", "time", "known",
    "part", "made", "around", "often", "called", "including", "however",
    "within", "along", "became", "become", "several", "large", "small",
  ]);
  const words = text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").split(/\s+/);
  return new Set(words.filter((w) => w.length > 2 && !stop.has(w)));
}

/**
 * Finds shared meaningful words between two texts.
 */
function findSharedTopics(textA: string, textB: string): string[] {
  const wordsA = significantWords(textA);
  const wordsB = significantWords(textB);
  const shared: string[] = [];
  for (const w of wordsA) {
    if (wordsB.has(w)) shared.push(w);
  }
  return shared.sort((a, b) => b.length - a.length).slice(0, 5);
}

/**
 * Finds the sentence in `text` that's most relevant to the target article title.
 */
function findRelevantSentence(text: string, targetTitle: string): string | null {
  const sentences = text
    .replace(/\n/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.length > 20 && s.length < 200);

  const titleWords = targetTitle
    .toLowerCase()
    .split(/[\s\-_]+/)
    .filter((w) => w.length > 2);

  let best: string | null = null;
  let bestScore = 0;

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    let score = 0;
    for (const w of titleWords) {
      if (lower.includes(w)) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = sentence.trim();
    }
  }

  return bestScore >= 2 ? best : null;
}

/**
 * Generates a connection explanation between two adjacent articles.
 */
function describeConnection(
  from: RabbitHoleArticle,
  to: RabbitHoleArticle
): string {
  const relevantFromExtract = findRelevantSentence(from.extract, to.title);
  if (relevantFromExtract) {
    return relevantFromExtract;
  }

  const relevantToExtract = findRelevantSentence(to.extract, from.title);
  if (relevantToExtract) {
    return relevantToExtract;
  }

  const shared = findSharedTopics(from.extract, to.extract);
  if (shared.length >= 2) {
    return `Both articles touch on ${shared.slice(0, 3).join(", ")} — linking ${stripParenthetical(from.title)} to ${stripParenthetical(to.title)}.`;
  }

  const fromDesc = from.description || stripParenthetical(from.title);
  const toDesc = to.description || stripParenthetical(to.title);
  return `${fromDesc} connects to ${toDesc} through Wikipedia's link network.`;
}

const OPENERS = [
  "How",
  "The unexpected link between",
  "What",
  "The surprising path from",
];

export function generateNarrative(
  articles: RabbitHoleArticle[]
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
    const nextArticle = articles[i + 1];
    let connection = "";
    let segue = "";

    if (i < articles.length - 1 && nextArticle) {
      connection = describeConnection(article, nextArticle);
      segue = `→ ${stripParenthetical(nextArticle.title)}`;
    } else {
      segue = "and there you have it.";
    }

    return { title: article.title, segue, connection };
  });

  const connectionHighlights = steps
    .filter((s) => s.connection)
    .map((s) => s.connection)
    .slice(0, 2);

  const middleNames = articles
    .slice(1, -1)
    .map((a) => stripParenthetical(a.title));
  const through =
    middleNames.length > 0
      ? `, passing through ${middleNames.join(", ")}`
      : "";

  const summaryBase = `This rabbit hole takes you from "${stripParenthetical(first.title)}" to "${stripParenthetical(last.title)}"${through}.`;
  const summaryDetail = connectionHighlights.length > 0
    ? ` ${connectionHighlights[0]}`
    : "";

  return {
    pullQuote,
    summary: summaryBase + summaryDetail,
    steps,
  };
}
