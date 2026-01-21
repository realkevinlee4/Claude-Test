# Quick Setup Guide

This guide will help you get the Daily News Aggregator up and running in under 10 minutes.

## Step 1: Get API Keys (5 minutes)

### Required: NewsAPI (Free)

1. Go to https://newsapi.org/register
2. Fill out the registration form
3. Copy your API key
4. Paste it into `.env` as `NEWSAPI_KEY=your_key`

**Note**: Free tier gives you 100 requests per day, which is sufficient for testing.

### Required: ProPublica Congress API (Free)

1. Go to https://www.propublica.org/datastore/api/propublica-congress-api
2. Click "Request API Key"
3. Fill out the form (approved instantly)
4. Copy your API key from the email
5. Paste it into `.env` as `PROPUBLICA_API_KEY=your_key`

**Note**: No rate limits, completely free forever!

### Optional: Twitter API

If you want Twitter integration:

1. Go to https://developer.twitter.com/
2. Create a developer account (approval may take 1-2 days)
3. Create a new app
4. Generate a Bearer Token
5. Add to `.env` as `TWITTER_BEARER_TOKEN=your_token`

**Note**: You can skip this initially - the system works fine without it.

### Optional: Reddit API

Reddit data can be accessed without authentication for public posts, but you can optionally set up credentials:

1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Select "script" type
4. Copy your client ID and secret
5. Add to `.env`

**Note**: Reddit works without credentials for public data.

## Step 2: Install and Configure (3 minutes)

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your API keys
nano .env  # or use your favorite editor

# Build the project
npm run build
```

Your `.env` file should look like this (minimum):

```env
NEWSAPI_KEY=abc123your_actual_key_here
PROPUBLICA_API_KEY=xyz789your_actual_key_here
TZ=America/New_York
```

## Step 3: Test Run (1 minute)

Test with a manual hourly update:

```bash
npm start hourly
```

You should see:
- API connections being made
- Articles being collected
- A report being generated in `./reports/`

## Step 4: Start the Scheduler (1 second)

```bash
npm start
```

The system will:
- Run an initial aggregation immediately
- Schedule hourly updates (8 AM - 6 PM EST)
- Schedule overnight summaries (9:00 AM EST)
- Keep running until you stop it (Ctrl+C)

## Verification

Check that everything is working:

```bash
# Check reports were generated
ls -la reports/

# Check database was created
ls -la data/

# View a sample report
cat reports/hourly_*.md | head -50
```

## Troubleshooting

### "No API keys configured"

Make sure your `.env` file:
- Exists in the root directory
- Contains valid API keys
- Has no spaces around the `=` signs

### "Error fetching news"

- Verify your NewsAPI key at https://newsapi.org/account
- Check you haven't exceeded rate limits (100/day on free tier)
- Try waiting an hour and running again

### "Database errors"

- Make sure the `data/` directory is writable
- If needed: `mkdir -p data && chmod 755 data`

### "Timezone issues"

- Set `TZ=America/New_York` in `.env`
- Restart the application after changing `.env`

## Production Deployment

For long-term running, use PM2:

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/index.js --name news-aggregator

# Make it start on system boot
pm2 startup
pm2 save

# View logs
pm2 logs news-aggregator
```

## Next Steps

1. **Customize keywords**: Edit `src/config/config.ts` to change search terms
2. **Adjust schedules**: Modify `.env` to change update times
3. **Add more sources**: Extend the service classes to add new APIs
4. **Set up notifications**: Add email or Slack notifications when reports are generated

## Getting Help

- Check the main README.md for detailed documentation
- Review the inline code comments
- Check existing GitHub issues
- Create a new issue if you're stuck

## API Key Security

**Important**: Never commit your `.env` file to version control!

The `.gitignore` file already excludes it, but double-check:
- `.env` is listed in `.gitignore`
- Use `.env.example` for sharing configuration templates
- Rotate API keys if accidentally exposed

## Cost Considerations

Current setup costs:
- NewsAPI Free: $0/month (100 requests/day)
- ProPublica: $0/month (unlimited)
- Reddit: $0/month (public data)
- Twitter: $0/month (if using free tier) or $100+/month for higher tiers

For production with more than 100 news requests per day:
- NewsAPI Developer: $449/month (250,000 requests/month)
- Consider alternative news APIs or RSS feeds

## Success Checklist

- [ ] Got NewsAPI key
- [ ] Got ProPublica API key
- [ ] Created `.env` file with keys
- [ ] Ran `npm install`
- [ ] Ran `npm run build`
- [ ] Tested with `npm start hourly`
- [ ] Saw reports generated in `./reports/`
- [ ] Started scheduler with `npm start`

Congratulations! Your news aggregator is now running.
