# Quick Start - Get Running in 2 Minutes

## Option 1: With Web Interface (Recommended)

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Build the project
npm run build

# 3. Start with web interface
npm start web
```

**Open your browser to**: http://localhost:3000

You'll see:
- 📊 Beautiful reports dashboard
- 🔄 Auto-refreshing reports
- 📱 Four organized tabs
- ✅ System status

## Option 2: Command Line Only

```bash
# Start the automated scheduler
npm start

# Or run a single update
npm start hourly
```

Reports saved to: `./reports/`

## View Reports

### Web Browser
```
http://localhost:3000
```

### Command Line
```bash
# List all reports
ls -lh reports/

# View latest report
cat reports/hourly_*.md | tail -100

# View overnight summary
cat reports/overnight_summary_*.md
```

## What Runs Automatically

- ⏰ **8 AM - 6 PM EST**: Hourly news updates
- 🌅 **9:00 AM EST**: Overnight summary (daily)
- 🧹 **2:00 AM EST**: Automatic cleanup

## Get API Keys

You need at least one of these (both free):

1. **NewsAPI** (100 requests/day free)
   - https://newsapi.org/register
   - Add to `.env`: `NEWSAPI_KEY=your_key`

2. **ProPublica Congress API** (unlimited, free)
   - https://www.propublica.org/datastore/api/propublica-congress-api
   - Add to `.env`: `PROPUBLICA_API_KEY=your_key`

## Test It Works

```bash
# Run a test update
npm start hourly

# Check if reports were created
ls -la reports/

# If web interface is running, visit:
curl http://localhost:3000/api/status
```

## Troubleshooting

**"No articles collected"**
→ Add your API keys to `.env` file

**"Port 3000 already in use"**
→ Change port: `PORT=8080 npm start web`

**"Module not found"**
→ Run: `npm install && npm run build`

## Next Steps

- ✅ Add your API keys to `.env`
- ✅ Run `npm start web` to see the web interface
- ✅ Open http://localhost:3000 in your browser
- ✅ Watch reports generate automatically

**That's it!** 🎉

For detailed documentation:
- `README.md` - Complete system documentation
- `WEB_INTERFACE_GUIDE.md` - Web interface features
- `GITHUB_ACTIONS_SETUP.md` - Deploy to GitHub Actions
- `SCHEDULER_INFO.md` - Scheduler monitoring
