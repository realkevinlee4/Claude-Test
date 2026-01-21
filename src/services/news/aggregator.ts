import { NewsArticle } from '../../types';
import NewsAPIService from './newsapi';
import { CongressService } from '../congress/propublica';
import { RedditService } from '../social/reddit';
import NewsDatabase from '../../models/database';

export class NewsAggregator {
  private newsAPI: NewsAPIService;
  private congressService: CongressService;
  private redditService: RedditService;
  private db: NewsDatabase;

  constructor(db: NewsDatabase) {
    this.newsAPI = new NewsAPIService();
    this.congressService = new CongressService();
    this.redditService = new RedditService();
    this.db = db;
  }

  async aggregateAll(): Promise<number> {
    console.log('Starting news aggregation...');
    const startTime = Date.now();
    let totalArticles = 0;

    try {
      // Fetch from all sources
      const [
        aiNews,
        trumpNews,
        russiaUkraineNews,
        iranNews,
        foreignAffairsNews,
        internalOpsNews,
        congressArticles,
        socialMediaArticles
      ] = await Promise.all([
        this.newsAPI.getAINews(),
        this.newsAPI.getTrumpNews(),
        this.newsAPI.getRussiaUkraineNews(),
        this.newsAPI.getIranNews(),
        this.newsAPI.getForeignAffairsNews(),
        this.newsAPI.getInternalOpsNews(),
        this.congressService.getAllCongressNews(),
        this.redditService.getRelevantPosts()
      ]);

      // Combine all articles
      const allArticles = [
        ...aiNews,
        ...trumpNews,
        ...russiaUkraineNews,
        ...iranNews,
        ...foreignAffairsNews,
        ...internalOpsNews,
        ...congressArticles,
        ...socialMediaArticles
      ];

      // Save to database
      totalArticles = this.db.saveArticles(allArticles);

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`Aggregation complete: ${totalArticles} new articles saved in ${duration}s`);

      return totalArticles;
    } catch (error) {
      console.error('Error during aggregation:', error);
      return totalArticles;
    }
  }

  async aggregateCategory(category: string): Promise<number> {
    let articles: NewsArticle[] = [];

    switch (category.toLowerCase()) {
      case 'ai':
        articles = await this.newsAPI.getAINews();
        break;
      case 'trump':
        articles = await this.newsAPI.getTrumpNews();
        break;
      case 'russia-ukraine':
        articles = await this.newsAPI.getRussiaUkraineNews();
        break;
      case 'iran':
        articles = await this.newsAPI.getIranNews();
        break;
      case 'foreign-affairs':
        articles = await this.newsAPI.getForeignAffairsNews();
        break;
      case 'congress':
        articles = await this.congressService.getAllCongressNews();
        break;
      case 'internal':
        articles = await this.newsAPI.getInternalOpsNews();
        break;
      default:
        console.log(`Unknown category: ${category}`);
        return 0;
    }

    return this.db.saveArticles(articles);
  }
}

export default NewsAggregator;
