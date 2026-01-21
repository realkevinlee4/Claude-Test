import axios from 'axios';
import { NewsArticle, NewsCategory, CongressBill } from '../../types';
import config from '../../config/config';

export class CongressService {
  private baseUrl = 'https://api.propublica.org/congress/v1';
  private apiKey: string;
  private currentCongress = 119; // 119th Congress (2025-2027)

  constructor() {
    this.apiKey = config.propublicaApiKey;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getHeaders() {
    return {
      'X-API-Key': this.apiKey
    };
  }

  async getRecentBills(chamber: 'house' | 'senate'): Promise<NewsArticle[]> {
    if (!this.apiKey) {
      console.warn('ProPublica API key not configured, skipping Congress data');
      return [];
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.currentCongress}/${chamber}/bills/introduced.json`,
        { headers: this.getHeaders() }
      );

      const bills = response.data.results[0].bills || [];
      const category = chamber === 'senate' ? NewsCategory.SENATE_BILLS : NewsCategory.HOUSE_BILLS;

      return bills.slice(0, 20).map((bill: any) => ({
        title: `${bill.number}: ${bill.title || bill.short_title}`,
        description: bill.summary || `Introduced by ${bill.sponsor_name || 'Unknown'} on ${bill.introduced_date}`,
        url: bill.congressdotgov_url || `https://www.congress.gov/bill/${this.currentCongress}th-congress/${chamber === 'senate' ? 'senate' : 'house'}-bill/${bill.number.split('.')[1]}`,
        source: 'ProPublica Congress API',
        category,
        publishedAt: new Date(bill.introduced_date || bill.latest_major_action_date),
        content: `Latest Action: ${bill.latest_major_action || 'N/A'}`,
        author: bill.sponsor_name
      }));
    } catch (error: any) {
      console.error(`Error fetching ${chamber} bills:`, error.message);
      return [];
    }
  }

  async getUpcomingHearings(): Promise<NewsArticle[]> {
    // Note: ProPublica doesn't have a direct hearings endpoint
    // This is a placeholder - in production, you might scrape from congress.gov
    // or use the official Congress.gov API (requires separate registration)
    return [];
  }

  async getRecentVotes(chamber: 'house' | 'senate'): Promise<NewsArticle[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.currentCongress}/${chamber}/votes/recent.json`,
        { headers: this.getHeaders() }
      );

      const votes = response.data.results.votes || [];

      return votes.slice(0, 10).map((vote: any) => ({
        title: `Vote: ${vote.question || vote.description}`,
        description: `Result: ${vote.result}. ${vote.bill ? `On ${vote.bill.number}: ${vote.bill.title}` : ''}`,
        url: vote.url || `https://www.congress.gov`,
        source: 'ProPublica Congress API',
        category: NewsCategory.CONGRESS_BILLS,
        publishedAt: new Date(vote.date + ' ' + vote.time),
        content: `${vote.democratic?.yes || 0} Democrats yes, ${vote.democratic?.no || 0} no. ${vote.republican?.yes || 0} Republicans yes, ${vote.republican?.no || 0} no.`
      }));
    } catch (error: any) {
      console.error(`Error fetching ${chamber} votes:`, error.message);
      return [];
    }
  }

  async getAllCongressNews(): Promise<NewsArticle[]> {
    const articles: NewsArticle[] = [];

    try {
      const [senateBills, houseBills, senateVotes, houseVotes] = await Promise.all([
        this.getRecentBills('senate'),
        this.getRecentBills('house'),
        this.getRecentVotes('senate'),
        this.getRecentVotes('house')
      ]);

      articles.push(...senateBills, ...houseBills, ...senateVotes, ...houseVotes);
    } catch (error) {
      console.error('Error fetching Congress news:', error);
    }

    return articles;
  }

  async searchBills(query: string): Promise<CongressBill[]> {
    if (!this.apiKey) {
      return [];
    }

    try {
      // ProPublica search endpoint
      const response = await axios.get(
        `${this.baseUrl}/bills/search.json`,
        {
          params: { query },
          headers: this.getHeaders()
        }
      );

      const bills = response.data.results[0]?.bills || [];

      return bills.map((bill: any) => ({
        billId: bill.bill_id,
        title: bill.title || bill.short_title,
        introducedDate: bill.introduced_date,
        latestAction: bill.latest_major_action,
        sponsor: bill.sponsor_name,
        chamber: bill.bill_id.includes('s') ? 'senate' : 'house',
        url: bill.congressdotgov_url,
        summary: bill.summary
      }));
    } catch (error: any) {
      console.error('Error searching bills:', error.message);
      return [];
    }
  }
}

export default CongressService;
