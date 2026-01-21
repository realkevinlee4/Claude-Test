# Scheduler Running - Status

## ✅ Active Schedulers

The Daily News Aggregator is now running automatically in the background!

### Schedule:

| Time (EST) | Action | Frequency |
|------------|--------|-----------|
| 8 AM - 6 PM | Hourly Update | Every hour on the hour |
| 9:00 AM | Overnight Summary | Once daily |
| 2:00 AM | Database Cleanup | Once daily |

### Background Process:

- **Process ID**: b601084
- **Started**: January 21, 2026 at 11:06 AM EST
- **Output Log**: `/tmp/claude/-home-user-Claude-Test/tasks/b601084.output`

### Next Scheduled Runs:

Based on current time (11:06 AM EST):

- **Next Hourly Update**: 12:00 PM EST (in ~54 minutes)
- **Next Overnight Summary**: Tomorrow at 9:00 AM EST
- **Next Cleanup**: Tomorrow at 2:00 AM EST

## Viewing Reports:

Reports are saved to: `./reports/`

### Check for new reports:

```bash
# List all reports
ls -lh reports/

# View latest hourly report
cat reports/hourly_*.md | tail -100

# View overnight summary
cat reports/overnight_summary_*.md | tail -100
```

## Monitoring the Scheduler:

### View live logs:

```bash
# Watch logs in real-time
tail -f /tmp/claude/-home-user-Claude-Test/tasks/b601084.output

# View last 50 lines
tail -50 /tmp/claude/-home-user-Claude-Test/tasks/b601084.output
```

### Check if running:

```bash
# List background processes
jobs

# Or check process
ps aux | grep "node dist/index.js"
```

## Stopping the Scheduler:

If you need to stop it:

```bash
# Stop the background process
kill %1

# Or find and kill by PID
ps aux | grep "node dist/index.js" | grep -v grep | awk '{print $2}' | xargs kill
```

## Improving Results:

Currently getting some API errors. To fix:

1. **Add ProPublica API Key**:
   - Get free key: https://www.propublica.org/datastore/api/propublica-congress-api
   - Update line 13 in `.env`
   - Restart scheduler

2. **Check NewsAPI Rate Limits**:
   - Free tier: 100 requests/day
   - May need to space out requests more
   - Or upgrade to paid tier

3. **Reddit Errors**:
   - Server-side issues (500s)
   - Not critical - system works without it

## Restart After Config Changes:

After updating `.env` with your ProPublica key:

```bash
# Kill current scheduler
kill %1

# Restart
npm start &

# Watch logs
tail -f /tmp/claude/-home-user-Claude-Test/tasks/*.output
```

## Success!

The system is running 24/7 and will:
- Generate hourly reports automatically
- Create overnight summaries each morning
- Clean up old data automatically
- Save all reports to `./reports/` folder

Check back at the top of each hour (8 AM - 6 PM) to see new reports!
