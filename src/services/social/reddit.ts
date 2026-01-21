import axios from 'axios';
import { NewsArticle, NewsCategory } from '../../types';
import config from '../../config/config';

export class RedditService {
  private baseUrl = 'https://www.reddit.com';
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor() {}

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    // Reddit allows read-only access without OAuth for public posts
    // We'll use the public JSON API which doesn't require authentication
    return '';
  }

  async searchSubreddit(subreddit: string, query: string, category: NewsCategory): Promise<NewsArticle[]> {
    try {
      // Use Reddit's public JSON API
      const response = await axios.get(
        `${this.baseUrl}/r/${subreddit}/search.json`,
        {
          params: {
            q: query,
            restrict_sr: 'true',
            sort: 'new',
            t: 'day',
            limit: 25
          },
          headers: {
            'User-Agent': config.redditUserAgent
          }
        }
      );

      const posts = response.data.data.children || [];

      return posts.map((post: any) => {
        const data = post.data;
        return {
          title: data.title,
          description: data.selftext?.substring(0, 300) || data.title,
          url: `https://www.reddit.com${data.permalink}`,
          source: `Reddit - r/${subreddit}`,
          category,
          publishedAt: new Date(data.created_utc * 1000),
          content: data.selftext,
          author: data.author,
          imageUrl: data.thumbnail && data.thumbnail.startsWith('http') ? data.thumbnail : undefined
        };
      });
    } catch (error: any) {
      console.error(`Error fetching from r/${subreddit}:`, error.message);
      return [];
    }
  }

  async getRelevantPosts(): Promise<NewsArticle[]> {
    const articles: NewsArticle[] = [];

    try {
      // Search relevant subreddits
      const subreddits = [
        { name: 'artificial', category: NewsCategory.AI_PROJECTS, query: 'AI OR "machine learning" OR GPT' },
        { name: 'MachineLearning', category: NewsCategory.AI_PROJECTS, query: '' },
        { name: 'politics', category: NewsCategory.CONGRESS_BILLS, query: 'congress OR bill OR legislation' },
        { name: 'worldnews', category: NewsCategory.FOREIGN_AFFAIRS, query: '' },
        { name: 'UkrainianConflict', category: NewsCategory.RUSSIA_UKRAINE, query: '' },
        { name: 'Conservative', category: NewsCategory.TRUMP_ACTIONS, query: 'Trump' },
        { name: 'technology', category: NewsCategory.AI_PROJECTS, query: 'AI OR artificial intelligence' }
      ];

      for (const sub of subreddits) {
        const posts = await this.searchSubreddit(sub.name, sub.query, sub.category);
        articles.push(...posts);
        await this.delay(2000); // Rate limiting
      }

      // Search for internal ops mentions
      const internalSearch = await this.searchAll(
        config.keywords.internalOps.join(' OR '),
        NewsCategory.INTERNAL_OPS
      );
      articles.push(...internalSearch);

    } catch (error) {
      console.error('Error fetching Reddit posts:', error);
    }

    return articles;
  }

  async searchAll(query: string, category: NewsCategory): Promise<NewsArticle[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/search.json`,
        {
          params: {
            q: query,
            sort: 'new',
            t: 'day',
            limit: 50
          },
          headers: {
            'User-Agent': config.redditUserAgent
          }
        }
      );

      const posts = response.data.data.children || [];

      return posts.map((post: any) => {
        const data = post.data;
        return {
          title: data.title,
          description: data.selftext?.substring(0, 300) || data.title,
          url: `https://www.reddit.com${data.permalink}`,
          source: `Reddit - r/${data.subreddit}`,
          category,
          publishedAt: new Date(data.created_utc * 1000),
          content: data.selftext,
          author: data.author
        };
      });
    } catch (error: any) {
      console.error('Error searching Reddit:', error.message);
      return [];
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default RedditService;
