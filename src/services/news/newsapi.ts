import axios from 'axios';
import { NewsArticle, NewsCategory } from '../../types';
import config from '../../config/config';

export class NewsAPIService {
  private baseUrl = 'https://newsapi.org/v2';
  private apiKey: string;
  private headlinesCache: NewsArticle[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache

  constructor() {
    this.apiKey = config.newsApiKey;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get all headlines ONCE and cache for 1 hour to avoid hitting rate limits
  private async getAllHeadlines(): Promise<NewsArticle[]> {
    // Check cache first
    const now = Date.now();
    if (this.headlinesCache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      console.log('Using cached headlines');
      return this.headlinesCache;
    }

    if (!this.apiKey) {
      console.warn('NewsAPI key not configured, skipping NewsAPI search');
      return [];
    }

    try {
      console.log('Fetching fresh headlines from NewsAPI...');
      const response = await axios.get(`${this.baseUrl}/top-headlines`, {
        params: {
          country: 'us',
          pageSize: 100,
          language: 'en'
        },
        headers: {
          'X-Api-Key': this.apiKey
        }
      });

      if (response.data.status === 'ok') {
        const headlines: NewsArticle[] = response.data.articles.map((article: any) => ({
          title: article.title,
          description: article.description || '',
          url: article.url,
          source: article.source.name,
          category: NewsCategory.AI_PROJECTS, // Will be reassigned
          publishedAt: new Date(article.publishedAt),
          content: article.content,
          author: article.author,
          imageUrl: article.urlToImage
        })).filter((a: NewsArticle) => a.title && a.url && a.title !== '[Removed]');

        this.headlinesCache = headlines;
        this.cacheTimestamp = now;
        console.log(`✅ Fetched ${headlines.length} headlines from NewsAPI`);
        return headlines;
      }

      return [];
    } catch (error: any) {
      console.error('Error fetching headlines from NewsAPI:', error.message);
      return [];
    }
  }

  async searchNews(query: string, category: NewsCategory, fromDate?: Date): Promise<NewsArticle[]> {
    // Get cached headlines (makes only 1 API call per hour max)
    const allHeadlines = await this.getAllHeadlines();

    // Client-side filtering by keyword (since free tier can't search via API)
    const keywords = query.toLowerCase().split(' or ').map(k => k.trim());
    const filtered = allHeadlines.filter(article => {
      const searchText = `${article.title} ${article.description} ${article.content || ''}`.toLowerCase();
      return keywords.some(keyword => searchText.includes(keyword));
    });

    // Assign correct category
    return filtered.map(article => ({
      ...article,
      category
    }));
  }

  async getAINews(): Promise<NewsArticle[]> {
    // Free tier: get all headlines once, filter for multiple keywords client-side
    const query = config.keywords.ai.slice(0, 5).join(' OR ');
    return await this.searchNews(query, NewsCategory.AI_PROJECTS);
  }

  async getTrumpNews(): Promise<NewsArticle[]> {
    // Free tier: get all headlines once, filter for multiple keywords client-side
    const query = config.keywords.trump.join(' OR ');
    return await this.searchNews(query, NewsCategory.TRUMP_ACTIONS);
  }

  async getRussiaUkraineNews(): Promise<NewsArticle[]> {
    const query = config.keywords.russiaukraine.slice(0, 3).join(' OR ');
    return await this.searchNews(query, NewsCategory.RUSSIA_UKRAINE);
  }

  async getIranNews(): Promise<NewsArticle[]> {
    const query = config.keywords.iran.join(' OR ');
    return await this.searchNews(query, NewsCategory.IRAN);
  }

  async getForeignAffairsNews(): Promise<NewsArticle[]> {
    const query = config.keywords.foreignAffairs.slice(0, 3).join(' OR ');
    return await this.searchNews(query, NewsCategory.FOREIGN_AFFAIRS);
  }

  async getInternalOpsNews(): Promise<NewsArticle[]> {
    // Free tier: get all headlines once, filter for multiple keywords client-side
    const query = config.keywords.internalOps.join(' OR ');
    return await this.searchNews(query, NewsCategory.INTERNAL_OPS);
  }

  private deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
    const seen = new Set<string>();
    return articles.filter(article => {
      if (seen.has(article.url)) {
        return false;
      }
      seen.add(article.url);
      return true;
    });
  }
}

export default NewsAPIService;
