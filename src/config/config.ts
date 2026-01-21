import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  // API Keys
  newsApiKey: process.env.NEWSAPI_KEY || '',
  twitterBearerToken: process.env.TWITTER_BEARER_TOKEN || '',
  redditClientId: process.env.REDDIT_CLIENT_ID || '',
  redditClientSecret: process.env.REDDIT_CLIENT_SECRET || '',
  redditUserAgent: process.env.REDDIT_USER_AGENT || 'DailyNewsAggregator/1.0',
  propublicaApiKey: process.env.PROPUBLICA_API_KEY || '',

  // Paths
  reportsDir: process.env.REPORTS_DIR || path.join(process.cwd(), 'reports'),
  databasePath: process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'news.db'),

  // Scheduling
  hourlySchedule: process.env.HOURLY_SCHEDULE || '0 8-18 * * *', // Every hour from 8AM to 6PM EST
  overnightSummarySchedule: process.env.OVERNIGHT_SUMMARY_SCHEDULE || '0 9 * * *', // 9AM EST daily

  // Timezone
  timezone: process.env.TZ || 'America/New_York',

  // Search Keywords
  keywords: {
    ai: ['artificial intelligence', 'AI', 'machine learning', 'deep learning', 'neural network', 'GPT', 'ChatGPT', 'Claude', 'OpenAI', 'Anthropic', 'LLM', 'generative AI'],
    trump: ['Trump', 'President Trump', 'Donald Trump'],
    internalOps: ['Influenceable', 'Liam Rafizadeh', 'Cam Rafizadeh'],
    russiaukraine: ['Russia', 'Ukraine', 'Zelenskyy', 'Putin', 'Kyiv', 'Moscow', 'NATO'],
    iran: ['Iran', 'Tehran', 'Iranian', 'Khamenei', 'IRGC'],
    foreignAffairs: ['foreign policy', 'international relations', 'diplomacy', 'United Nations', 'UN Security Council', 'NATO', 'EU', 'European Union']
  },

  // Report Settings
  report: {
    maxArticlesPerCategory: 20,
    includeImages: true,
    sortBy: 'date' as const,
    overnightSummaryHours: 12 // Articles from last 12 hours for overnight summary
  },

  // Rate Limiting
  rateLimits: {
    newsApiDelay: 1000, // 1 second between requests
    twitterDelay: 2000, // 2 seconds between requests
    propublicaDelay: 1000 // 1 second between requests
  }
};

export default config;
