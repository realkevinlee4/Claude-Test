# Running on GitHub Actions - Complete Setup Guide

This guide shows you how to run the Daily News Aggregator automatically on GitHub using GitHub Actions. No server required!

## Why GitHub Actions?

✅ **100% Free** - 2,000 minutes/month on public repos, 500 minutes on private repos
✅ **No Server Needed** - Runs in the cloud automatically
✅ **Automatic Commits** - Reports are committed back to your repo
✅ **Easy to Monitor** - Check logs and artifacts in GitHub UI
✅ **Scheduled Execution** - Runs hourly and generates overnight summaries

---

## Quick Setup (5 Minutes)

### Step 1: Add API Keys to GitHub Secrets

1. **Go to your repository on GitHub**
   - Navigate to: `https://github.com/YOUR_USERNAME/Claude-Test`

2. **Open Settings**
   - Click on **Settings** tab (top right)

3. **Navigate to Secrets**
   - In the left sidebar, click: **Secrets and variables** → **Actions**

4. **Add Repository Secrets**
   - Click the **"New repository secret"** button
   - Add the following secrets one by one:

#### Required Secrets:

**NEWSAPI_KEY**
```
Name: NEWSAPI_KEY
Secret: your_actual_newsapi_key_here
```
Get it at: https://newsapi.org/register

**PROPUBLICA_API_KEY**
```
Name: PROPUBLICA_API_KEY
Secret: your_actual_propublica_key_here
```
Get it at: https://www.propublica.org/datastore/api/propublica-congress-api

#### Optional Secrets (for Twitter & Reddit):

**TWITTER_BEARER_TOKEN** (Optional)
```
Name: TWITTER_BEARER_TOKEN
Secret: your_twitter_bearer_token_here
```

**REDDIT_CLIENT_ID** (Optional)
```
Name: REDDIT_CLIENT_ID
Secret: your_reddit_client_id_here
```

**REDDIT_CLIENT_SECRET** (Optional)
```
Name: REDDIT_CLIENT_SECRET
Secret: your_reddit_client_secret_here
```

### Step 2: Enable GitHub Actions

1. **Go to the Actions tab**
   - Click on the **Actions** tab in your repository

2. **Enable workflows**
   - If you see "Workflows aren't being run on this repository", click **"I understand my workflows, go ahead and enable them"**

3. **Find the workflow**
   - You should see "Daily News Aggregation" workflow

4. **Enable the workflow**
   - Click on the workflow name
   - If there's an "Enable workflow" button, click it

### Step 3: Run Manually (First Test)

1. **Go to Actions tab** → **Daily News Aggregation**

2. **Click "Run workflow"** (right side)

3. **Select command**:
   - Choose `hourly` for a test run

4. **Click green "Run workflow" button**

5. **Wait 2-5 minutes**
   - Watch the workflow run
   - Check for green checkmarks

6. **View the results**:
   - Click on the completed workflow run
   - Check the job logs
   - Download artifacts (reports)
   - **Go to your repository** → `reports/` folder to see the generated markdown files!

---

## How It Works

### Automatic Schedule

The workflow runs automatically:

| Time (EST) | Action | Frequency |
|------------|--------|-----------|
| 8 AM - 6 PM | Hourly Update | Every hour |
| 9:00 AM | Overnight Summary | Once daily |

**Note**: GitHub Actions uses UTC time internally, but the workflow is configured to run at EST times.

### What Happens Each Run:

1. ✅ Checks out your code
2. ✅ Sets up Node.js environment
3. ✅ Installs dependencies
4. ✅ Builds TypeScript
5. ✅ Creates `.env` with your secrets
6. ✅ Runs news aggregation
7. ✅ Commits reports back to repo
8. ✅ Uploads reports as artifacts

### Generated Files:

Reports are automatically committed to your repository in the `/reports` folder:

```
reports/
├── hourly_2026-01-21_14-00.md
├── hourly_2026-01-21_15-00.md
├── overnight_summary_2026-01-21.md
└── full_report_2026-01-21_09-00.md
```

---

## Viewing Reports

### Method 1: Browse on GitHub

1. Go to your repository
2. Click on the `reports/` folder
3. Click on any `.md` file
4. GitHub will render the Markdown beautifully

### Method 2: Download Artifacts

1. Go to **Actions** tab
2. Click on any completed workflow run
3. Scroll down to **Artifacts**
4. Download `news-reports-XXX.zip`
5. Extract and view the files

### Method 3: Clone and View Locally

```bash
git pull origin main
cat reports/overnight_summary_*.md
```

---

## Manual Triggers

You can manually trigger the workflow anytime:

### Via GitHub UI:

1. Go to **Actions** → **Daily News Aggregation**
2. Click **"Run workflow"**
3. Select command:
   - `hourly` - Single hourly update
   - `overnight` - Generate overnight summary
   - `cleanup` - Clean old articles
4. Click **"Run workflow"**

### Via GitHub CLI:

```bash
# Install GitHub CLI
gh auth login

# Trigger hourly update
gh workflow run news-aggregation.yml -f command=hourly

# Trigger overnight summary
gh workflow run news-aggregation.yml -f command=overnight

# View workflow runs
gh run list

# Watch a run in real-time
gh run watch
```

---

## Monitoring & Logs

### Check Workflow Status

1. **Actions Tab** - See all runs
2. **Green Check** = Success
3. **Red X** = Failed
4. **Yellow Circle** = Running

### View Logs

1. Click on any workflow run
2. Click on the job name
3. Expand steps to see detailed logs
4. Look for:
   - "✅ Collected X new articles"
   - "✅ Report saved: ./reports/..."

### View Summary

Each run generates a summary showing:
- Command executed
- Timestamp
- Generated reports
- Article counts

---

## Troubleshooting

### "No reports generated"

**Cause**: API keys might be missing or invalid

**Fix**:
1. Check GitHub Secrets are set correctly
2. Verify API keys are valid at their provider websites
3. Check workflow logs for error messages

### "Resource not accessible by integration"

**Cause**: Missing permissions

**Fix**:
1. Go to **Settings** → **Actions** → **General**
2. Scroll to "Workflow permissions"
3. Select "Read and write permissions"
4. Save

### "Rate limit exceeded"

**Cause**: NewsAPI free tier limit (100 requests/day)

**Fix**:
1. Reduce hourly frequency, or
2. Upgrade to NewsAPI paid tier, or
3. Wait until next day (limit resets at midnight UTC)

### "Workflow not running on schedule"

**Cause**: GitHub Actions may delay scheduled workflows

**Notes**:
- GitHub Actions can delay scheduled runs by up to 15 minutes during high load
- This is normal behavior
- Manual triggers always run immediately

---

## Cost & Limits

### GitHub Actions Free Tier:

| Account Type | Minutes/Month | Concurrent Jobs |
|--------------|---------------|-----------------|
| Public Repo | 2,000 minutes | 20 |
| Private Repo (Free) | 500 minutes | 5 |
| Private Repo (Pro) | 3,000 minutes | 5 |

### Estimated Usage:

- **Per hourly run**: ~2-3 minutes
- **Per day**: ~24-36 minutes (11 hourly + 1 overnight)
- **Per month**: ~720-1,080 minutes

✅ **Fits comfortably in free tier!**

### API Limits:

- **NewsAPI Free**: 100 requests/day
- **ProPublica**: Unlimited, free forever
- **Twitter**: Varies by tier
- **Reddit**: 60 requests/minute (public data, no auth needed)

---

## Advanced Configuration

### Change Schedule Times

Edit `.github/workflows/news-aggregation.yml`:

```yaml
schedule:
  # Change these cron expressions
  - cron: '0 13-23 * * *'  # Hourly (adjust UTC offset)
  - cron: '0 14 * * *'     # Overnight summary
```

**Cron Time Converter**: https://crontab.guru/

**EST to UTC**: Add 5 hours (EST) or 4 hours (EDT)

### Disable Auto-Commit

If you don't want reports committed to repo:

1. Comment out the "Commit and push reports" step
2. Reports will only be available as downloadable artifacts

### Add Email Notifications

To get notified when workflows fail:

1. Go to **Settings** → **Notifications**
2. Enable "Actions" notifications
3. Choose email or web notifications

---

## Production Tips

### 1. Use a Dedicated Branch

Create a `reports` branch for automated commits:

```bash
git checkout -b reports
git push -u origin reports
```

Update workflow to use this branch:
```yaml
- uses: actions/checkout@v4
  with:
    ref: reports
```

### 2. Clean Up Old Reports

Add a cleanup workflow that runs weekly:

```yaml
- name: Clean old reports
  run: |
    find reports -name "*.md" -mtime +7 -delete
    git add reports/
    git commit -m "🧹 Clean old reports" || true
    git push
```

### 3. Set Up Slack/Discord Notifications

Use GitHub Actions marketplace integrations:
- https://github.com/marketplace/actions/slack-notify
- https://github.com/marketplace/actions/discord-message-notify

### 4. Archive Reports to Cloud Storage

Add steps to upload to S3, Google Cloud Storage, etc.

---

## Comparison: GitHub Actions vs. Local Server

| Feature | GitHub Actions | Local Server |
|---------|----------------|--------------|
| **Cost** | Free (2000 min/month) | Server costs |
| **Maintenance** | Zero | Ongoing |
| **Reliability** | High (GitHub SLA) | Depends on setup |
| **Logs** | Built-in UI | Manual setup |
| **Scaling** | Automatic | Manual |
| **Setup Time** | 5 minutes | 30+ minutes |

**Recommendation**: Use GitHub Actions unless you need:
- More than 2000 minutes/month
- Real-time updates (faster than hourly)
- Custom integrations with local systems

---

## Security Best Practices

✅ **Do**:
- Use GitHub Secrets for all API keys
- Enable "Require approval for first-time contributors"
- Limit workflow permissions to minimum needed
- Regularly rotate API keys

❌ **Don't**:
- Commit API keys to repository
- Share secrets in logs
- Give workflows unnecessary permissions

---

## Getting Help

### Check Logs:
1. Actions tab → Click workflow run
2. Review step-by-step logs
3. Look for error messages

### Common Issues:
- See "Troubleshooting" section above
- Check main README.md
- Review GitHub Actions documentation

### Still Stuck?
- Create an issue in the repository
- Include workflow run URL
- Copy relevant log sections

---

## Success Checklist

- [ ] Added API keys to GitHub Secrets (minimum: NEWSAPI_KEY, PROPUBLICA_API_KEY)
- [ ] Enabled GitHub Actions in repository
- [ ] Ran workflow manually and it succeeded
- [ ] Verified reports were generated in `/reports` folder
- [ ] Confirmed automatic schedule is set up
- [ ] Checked workflow permissions (read + write)

---

## Next Steps

1. ✅ Let it run automatically
2. 📊 Check reports daily in the `/reports` folder
3. 🔧 Customize keywords in `src/config/config.ts`
4. 📧 Set up notifications (optional)
5. 🚀 Share reports with your team

---

**Congratulations!** 🎉 Your news aggregator is now running automatically on GitHub!

Check back in an hour to see your first automated report.
