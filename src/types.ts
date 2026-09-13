export type ContentType = 'reel' | 'video' | 'carousel' | 'story';

export type EngagementType = 'liked' | 'saved' | 'shared' | 'watched';

export interface WatchItem {
  id: string;
  title: string;
  creator: string;
  handle: string;
  contentType: ContentType;
  category: string;
  durationSeconds: number;
  watchedAt: string;
  completionRate: number; // 0 to 100%
  engagement: EngagementType;
  tags: string[];
  notes?: string;
  url?: string;
}

export interface CategorySummary {
  category: string;
  count: number;
  percentage: number;
  keyThemes: string[];
}

export interface KeyTakeaway {
  topic: string;
  insight: string;
  creatorOrSource: string;
}

export interface ViewingPatterns {
  estimatedDailyMinutes: number;
  peakHoursLabel: string;
  rabbitHoles: string[];
  doomscrollRisk: 'Low' | 'Moderate' | 'High';
  dopamineScore: number; // 0 - 100
  educationalScore: number; // 0 - 100
}

export interface AlgorithmDietTip {
  action: string;
  tip: string;
}

export interface AnalysisSummary {
  overviewTitle: string;
  archetypeDescription: string;
  executiveSummary: string;
  topCategories: CategorySummary[];
  keyTakeaways: KeyTakeaway[];
  viewingPatterns: ViewingPatterns;
  algorithmDietAdvice: AlgorithmDietTip[];
  quote: string;
  generatedAt: string;
  isFallback?: boolean;
  notice?: string;
}

export interface PresetProfile {
  id: string;
  name: string;
  handle: string;
  bio: string;
  avatarBg: string;
  badge: string;
  description: string;
  items: WatchItem[];
}
