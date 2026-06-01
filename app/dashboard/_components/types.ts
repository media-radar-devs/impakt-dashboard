// Shared data shapes for dashboard pages. Most article fields are nullable to
// match the DB reality (scraped rows often miss metadata).

export type Article = {
  id: string;
  title: string | null;
  url: string | null;
  source: string | null;
  published_at: string | null;
  image_url: string | null;
  content: string | null;
};

export type Match = {
  id: string;
  matched_term: string | null;
  notified_telegram: boolean;
  created_at: string;
  articles: Article | null;
};
