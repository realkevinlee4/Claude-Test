export interface NewsArticle {
  id?: number;
  title: string;
  description: string;
  url: string;
  source: string;
  category: NewsCategory;
  publishedAt: Date;
  content?: string;
  author?: string;
  imageUrl?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  createdAt?: Date;
}

export enum NewsCategory {
  AI_PROJECTS = 'AI Projects and News',
  CONGRESS_BILLS = 'US Congress Laws and Bills',
  CAPITOL_HEARINGS = 'Key Hearings on Capitol Hill',
  SENATE_BILLS = 'Introduced Bills - US Senate',
  HOUSE_BILLS = 'Introduced Bills - US House',
  TRUMP_ACTIONS = 'President Trump\'s Actions',
  SOCIAL_CONTROVERSIES = 'Social Media Controversies',
  INTERNAL_OPS = 'Internal Ops',
  RUSSIA_UKRAINE = 'Russia-Ukraine Updates',
  IRAN = 'Iran Updates',
  FOREIGN_AFFAIRS = 'Foreign Affairs'
}

export interface CongressBill {
  billId: string;
  title: string;
  introducedDate: string;
  latestAction: string;
  sponsor: string;
  chamber: 'senate' | 'house';
  url: string;
  summary?: string;
}

export interface CongressHearing {
  title: string;
  date: string;
  committee: string;
  description: string;
  url?: string;
}

export interface SocialMediaPost {
  platform: 'twitter' | 'reddit';
  text: string;
  author: string;
  url: string;
  timestamp: Date;
  engagement?: {
    likes?: number;
    retweets?: number;
    comments?: number;
  };
}

export interface DailyReport {
  date: Date;
  articles: Map<NewsCategory, NewsArticle[]>;
  generatedAt: Date;
}

export interface ReportConfig {
  includeImages: boolean;
  maxArticlesPerCategory: number;
  sortBy: 'date' | 'relevance';
}
