// Auto-generated recommended articles data
// Last updated: 2026-02-18

import articlesData from "./recommendedArticles.json";

export interface RecommendedArticle {
  title: string;
  url: string;
  source: string;
  language: "en" | "zh";
  description: string;
  articleType: "review" | "usage_guide" | "comparison" | "unboxing" | "chinese_guide" | "discussion";
  qualityScore: number;
  isEditorPick: boolean;
}

export interface ArticlesData {
  version: string;
  lastUpdated: string;
  totalArticles: number;
  articles: Record<string, RecommendedArticle[]>;
}

const data = articlesData as ArticlesData;

export function getKitArticles(kitId: string): RecommendedArticle[] {
  return data.articles[kitId] || [];
}

export function getEditorPicks(kitId: string): RecommendedArticle[] {
  return getKitArticles(kitId).filter((a) => a.isEditorPick);
}

export function getArticlesByLanguage(
  kitId: string,
  language: "en" | "zh"
): RecommendedArticle[] {
  return getKitArticles(kitId).filter((a) => a.language === language);
}

export function getArticleTypeLabel(
  type: RecommendedArticle["articleType"],
  lang: "cn" | "en"
): string {
  const labels: Record<RecommendedArticle["articleType"], { cn: string; en: string }> = {
    review: { cn: "评测", en: "Review" },
    usage_guide: { cn: "使用指南", en: "Guide" },
    comparison: { cn: "对比", en: "Comparison" },
    unboxing: { cn: "开箱", en: "Unboxing" },
    chinese_guide: { cn: "中文指南", en: "CN Guide" },
    discussion: { cn: "讨论", en: "Discussion" },
  };
  return labels[type]?.[lang] || type;
}

export { data as articlesData };
