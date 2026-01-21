import axios from 'axios';
import { NewsArticle, NewsCategory } from '../../types';
import config from '../../config/config';

export class TwitterService {
  private baseUrl = 'https://api.twitter.com/2';
  private bearerToken: string;

  constructor() {
    this.bearerToken = config.twitterBearerToken;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.bearerToken}`
    };
  }

  async searchTweets(query: string, category: NewsCategory, maxResults: number = 10): Promise<NewsArticle[]> {
    if (!this.bearerToken) {
      console.warn('Twitter Bearer Token not configured, skipping Twitter search');
      return [];
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/tweets/search/recent`,
        {
          params: {
            query: `${query} -is:retweet lang:en`,
            max_results: maxResults,
            'tweet.fields': 'created_at,public_metrics,author_id',
            'user.fields': 'username,name',
            'expansions': 'author_id'
          },
          headers: this.getHeaders()
        }
      );

      const tweets = response.data.data || [];
      const users = response.data.includes?.users || [];

      return tweets.map((tweet: any) => {
        const author = users.find((u: any) => u.id === tweet.author_id);
        const username = author?.username || 'unknown';

        return {
          title: `@${username}: ${tweet.text.substring(0, 100)}...`,
          description: tweet.text,
          url: `https://twitter.com/${username}/status/${tweet.id}`,
          source: 'Twitter',
          category,
          publishedAt: new Date(tweet.created_at),
          author: author?.name || username,
          content: tweet.text
        };
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.error('Twitter authentication failed - check your Bearer Token');
      } else if (error.response?.status === 429) {
        console.error('Twitter rate limit exceeded');
      } else {
        console.error('Error fetching tweets:', error.message);
      }
      return [];
    }
  }

  async getRelevantTweets(): Promise<NewsArticle[]> {
    const articles: NewsArticle[] = [];

    try {
      // AI tweets
      const aiTweets = await this.searchTweets(
        '(artificial intelligence OR AI OR GPT OR "machine learning") -crypto -token',
        NewsCategory.AI_PROJECTS,
        15
      );
      articles.push(...aiTweets);

      await this.delay(2000);

      // Trump tweets
      const trumpTweets = await this.searchTweets(
        'Trump OR @realDonaldTrump',
        NewsCategory.TRUMP_ACTIONS,
        15
      );
      articles.push(...trumpTweets);

      await this.delay(2000);

      // Internal ops mentions
      for (const keyword of config.keywords.internalOps) {
        const tweets = await this.searchTweets(keyword, NewsCategory.INTERNAL_OPS, 10);
        articles.push(...tweets);
        await this.delay(2000);
      }

    } catch (error) {
      console.error('Error fetching tweets:', error);
    }

    return articles;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default TwitterService;
