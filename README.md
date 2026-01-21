# Daily News Aggregator

An automated news aggregation and reporting system that collects breaking news from traditional media, social media, and government sources across multiple topics.

## Features

### News Categories Tracked

- **AI Projects and News** - Latest developments in artificial intelligence, machine learning, and generative AI
- **US Congress Laws and Bills** - Congressional legislation and votes
- **Key Hearings on Capitol Hill** - Important congressional hearings
- **Introduced Bills** - New bills in the Senate and House
- **President Trump's Actions** - Presidential activities and announcements
- **Social Media Controversies** - Trending social media discussions
- **Internal Ops** - Mentions of "Influenceable", "Liam Rafizadeh", or "Cam Rafizadeh"
- **Russia-Ukraine Updates** - Ongoing conflict developments
- **Iran Updates** - Iranian affairs and regional developments
- **Foreign Affairs** - International relations and diplomacy

### Automated Scheduling

- **Hourly Updates**: Every hour from 8 AM to 6 PM EST
- **Overnight Summary**: Daily at 9:00 AM EST (covers previous 12 hours)
- **Automatic Cleanup**: Removes old articles and reports automatically

### Data Sources

- **NewsAPI** - Traditional news media
- **ProPublica Congress API** - Congressional data
- **Reddit** - Social media discussions
- **Twitter/X API** - Social media posts (optional)

## Installation

### Prerequisites

- Node.js 18+ and npm
- API keys (see Configuration section)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Claude-Test
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## Configuration

### Required API Keys

Get free API keys from:

1. **NewsAPI** (Required)
   - Sign up at https://newsapi.org/
   - Free tier: 100 requests/day
   - Add to `.env`: `NEWSAPI_KEY=your_key_here`

2. **ProPublica Congress API** (Required)
   - Request at https://www.propublica.org/datastore/api/propublica-congress-api
   - Free, no rate limits
   - Add to `.env`: `PROPUBLICA_API_KEY=your_key_here`

### Optional API Keys

3. **Twitter API** (Optional but recommended)
   - Apply at https://developer.twitter.com/
   - Requires Twitter Developer Account
   - Add to `.env`: `TWITTER_BEARER_TOKEN=your_token_here`

4. **Reddit API** (Optional)
   - Create app at https://www.reddit.com/prefs/apps
   - Add to `.env`:
     ```
     REDDIT_CLIENT_ID=your_id
     REDDIT_CLIENT_SECRET=your_secret
     REDDIT_USER_AGENT=DailyNewsAggregator/1.0
     ```

### Environment Variables

```env
# Required
NEWSAPI_KEY=your_newsapi_key
PROPUBLICA_API_KEY=your_propublica_key

# Optional
TWITTER_BEARER_TOKEN=your_twitter_token
REDDIT_CLIENT_ID=your_reddit_id
REDDIT_CLIENT_SECRET=your_reddit_secret

# Configuration (defaults shown)
TZ=America/New_York
REPORTS_DIR=./reports
DATABASE_PATH=./data/news.db
```

## Usage

### Start the Automated Scheduler

```bash
npm start
```

This will:
- Start the hourly update scheduler (8 AM - 6 PM EST)
- Start the overnight summary scheduler (9:00 AM EST)
- Run an initial news aggregation
- Keep running until you stop it (Ctrl+C)

### Manual Commands

Run a single hourly update:
```bash
npm start hourly
```

Generate overnight summary:
```bash
npm start overnight
```

Clean old data:
```bash
npm start cleanup
```

Show help:
```bash
npm start help
```

### Development Mode

Run without building:
```bash
npm run dev
```

Watch mode (auto-rebuild):
```bash
npm run watch
```

## Output

### Reports Directory

All reports are saved to `./reports/` (configurable via `REPORTS_DIR`):

- `hourly_YYYY-MM-DD_HH-mm.md` - Hourly updates
- `overnight_summary_YYYY-MM-DD.md` - Daily overnight summaries
- `full_report_YYYY-MM-DD_HH-mm.md` - Complete reports

### Report Format

Reports are generated in Markdown format with:
- Table of contents
- Articles grouped by category
- Source attribution
- Timestamps in EST
- Direct links to original articles

### Database

Articles are stored in SQLite database at `./data/news.db` (configurable via `DATABASE_PATH`).

Features:
- Automatic deduplication
- Full-text search capability
- Indexed for fast queries
- Automatic cleanup of old articles

## Architecture

```
src/
├── config/
│   └── config.ts           # Configuration management
├── services/
│   ├── news/
│   │   ├── newsapi.ts      # NewsAPI integration
│   │   └── aggregator.ts   # News aggregation logic
│   ├── social/
│   │   ├── twitter.ts      # Twitter API integration
│   │   └── reddit.ts       # Reddit API integration
│   ├── congress/
│   │   └── propublica.ts   # ProPublica Congress API
│   └── scheduler.ts        # Cron scheduling
├── models/
│   └── database.ts         # SQLite database
├── reports/
│   └── generator.ts        # Report generation
├── types/
│   └── index.ts            # TypeScript definitions
└── index.ts                # Main entry point
```

## Scheduling Details

### Hourly Updates (8 AM - 6 PM EST)

Runs every hour on the hour:
- Aggregates news from all sources
- Saves new articles to database
- Generates hourly report
- Deduplicates articles automatically

### Overnight Summary (9:00 AM EST)

Runs once per day:
- Aggregates any overnight news
- Summarizes previous 12 hours
- Generates comprehensive daily report
- Provides executive summary with statistics

### Automatic Cleanup (2:00 AM EST)

Runs daily:
- Removes articles older than 30 days
- Removes reports older than 7 days
- Optimizes database

## Customization

### Modify Search Keywords

Edit `src/config/config.ts`:

```typescript
keywords: {
  ai: ['artificial intelligence', 'AI', 'machine learning', ...],
  trump: ['Trump', 'President Trump', ...],
  // Add your own keywords
}
```

### Change Schedule Times

Edit `.env`:

```env
# Hourly updates (cron format)
HOURLY_SCHEDULE=0 8-18 * * *

# Overnight summary (cron format)
OVERNIGHT_SUMMARY_SCHEDULE=0 9 * * *
```

### Adjust Report Settings

Edit `src/config/config.ts`:

```typescript
report: {
  maxArticlesPerCategory: 20,
  includeImages: true,
  sortBy: 'date',
  overnightSummaryHours: 12
}
```

## Troubleshooting

### No articles collected

- Check API keys in `.env`
- Verify API key validity at provider websites
- Check rate limits (NewsAPI free tier: 100 req/day)

### Database errors

- Ensure `data/` directory is writable
- Check disk space
- Try deleting `data/news.db` to reset

### Timezone issues

- Set `TZ=America/New_York` in `.env`
- Ensure your system timezone is configured correctly

### Rate limiting

- NewsAPI free tier is limited to 100 requests/day
- Consider upgrading to paid tier for production use
- Adjust `rateLimits` in `config.ts` if needed

## Production Deployment

### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/index.js --name daily-news-aggregator

# View logs
pm2 logs daily-news-aggregator

# Restart
pm2 restart daily-news-aggregator

# Stop
pm2 stop daily-news-aggregator
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### As a System Service

Create `/etc/systemd/system/news-aggregator.service`:

```ini
[Unit]
Description=Daily News Aggregator
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/Claude-Test
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
```

## API Rate Limits

| Service | Free Tier Limit | Notes |
|---------|----------------|-------|
| NewsAPI | 100 req/day | Consider paid tier for production |
| ProPublica | No limit | Free forever |
| Reddit | 60 req/minute | No auth required for public data |
| Twitter | Varies | Requires developer account |

## Contributing

Contributions welcome! Areas for improvement:

- Additional news sources
- Better sentiment analysis
- Email notifications
- Web dashboard
- More sophisticated categorization
- Natural language summaries

## License

MIT

## Support

For issues or questions:
1. Check existing GitHub issues
2. Review documentation
3. Create a new issue with details

## Changelog

### Version 1.0.0
- Initial release
- Multi-source news aggregation
- Automated scheduling
- Report generation
- SQLite storage
