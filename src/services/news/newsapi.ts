import axios from 'axios';
import { NewsArticle, NewsCategory } from '../../types';
import config from '../../config/config';

export class NewsAPIService {
  private baseUrl = 'https://newsapi.org/v2';
  private apiKey: string;

  constructor() {
    this.apiKey = config.newsApiKey;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async searchNews(query: string, category: NewsCategory, fromDate?: Date): Promise<NewsArticle[]> {
    if (!this.apiKey) {
      console.warn('NewsAPI key not configured, skipping NewsAPI search');
      return [];
    }

    try {
      const params: any = {
        q: query,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 100
      };

      if (fromDate) {
        params.from = fromDate.toISOString();
      }

      const response = await axios.get(`${this.baseUrl}/everything`, {
        params,
        headers: {
          'X-Api-Key': this.apiKey
        }
      });

      if (response.data.status === 'ok') {
        const articles: NewsArticle[] = response.data.articles.map((article: any) => ({
          title: article.title,
          description: article.description || '',
          url: article.url,
          source: article.source.name,
          category,
          publishedAt: new Date(article.publishedAt),
          content: article.content,
          author: article.author,
          imageUrl: article.urlToImage
        }));

        return articles.filter(a => a.title && a.url && a.title !== '[Removed]');
      }

      return [];
    } catch (error: any) {
      console.error(`Error fetching news for "${query}":`, error.message);
      return [];
    }
  }

  async getAINews(): Promise<NewsArticle[]> {
    const articles: NewsArticle[] = [];

    for (const keyword of config.keywords.ai) {
      const results = await this.searchNews(keyword, NewsCategory.AI_PROJECTS);
      articles.push(...results);
      await this.delay(config.rateLimits.newsApiDelay);
    }

    return this.deduplicateArticles(articles);
  }

  async getTrumpNews(): Promise<NewsArticle[]> {
    const articles: NewsArticle[] = [];

    for (const keyword of config.keywords.trump) {
      const results = await this.searchNews(keyword, NewsCategory.TRUMP_ACTIONS);
      articles.push(...results);
      await this.delay(config.rateLimits.newsApiDelay);
    }

    return this.deduplicateArticles(articles);
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
    const articles: NewsArticle[] = [];

    for (const keyword of config.keywords.internalOps) {
      const results = await this.searchNews(keyword, NewsCategory.INTERNAL_OPS);
      articles.push(...results);
      await this.delay(config.rateLimits.newsApiDelay);
    }

    return this.deduplicateArticles(articles);
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
