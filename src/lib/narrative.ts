import { RabbitHoleArticle } from "@/app/api/generate/route";

export interface RabbitHoleNarrative {
  pullQuote: string;
  summary: string;
  steps: { title: string; segue: string }[];
}

const CONNECTORS = [
  "which leads us to",
  "which surprisingly connects to",
  "opening the door to",
  "taking us down a path to",
  "which is intertwined with",
];

const OPENERS = [
  "How",
  "The unexpected link between",
  "What",
  "The surprising path from",
];

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
    const connIdx = Math.floor(
      Math.abs(Math.sin((i + 1) * 13 + article.title.length)) *
        CONNECTORS.length
    );
    return {
      title: article.title,
      segue:
        i < articles.length - 1
          ? CONNECTORS[connIdx]
          : "and there you have it.",
    };
  });

  const middleNames = articles
    .slice(1, -1)
    .map((a) => stripParenthetical(a.title));
  const through =
    middleNames.length > 0
      ? `, passing through ${middleNames.join(", ")}`
      : "";

  const summary = `This rabbit hole takes you from "${stripParenthetical(first.title)}" to "${stripParenthetical(last.title)}"${through}. ${pullQuote} — and the journey is as fascinating as the destination.`;

  return { pullQuote, summary, steps };
}
