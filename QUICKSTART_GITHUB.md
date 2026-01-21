# GitHub Actions Quick Start (2 Minutes)

Run your news aggregator automatically on GitHub - **no server required!**

## Step 1: Add API Keys (2 minutes)

### Get Your Free API Keys:

1. **NewsAPI** (required): https://newsapi.org/register
2. **ProPublica** (required): https://www.propublica.org/datastore/api/propublica-congress-api

### Add to GitHub Secrets:

1. Go to your repo: `https://github.com/YOUR_USERNAME/Claude-Test`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add these two secrets:

```
Name: NEWSAPI_KEY
Secret: [paste your NewsAPI key]
```

```
Name: PROPUBLICA_API_KEY
Secret: [paste your ProPublica key]
```

## Step 2: Enable Workflows (30 seconds)

1. Go to the **Actions** tab
2. Click **"I understand my workflows, go ahead and enable them"** (if prompted)
3. Find **"Manual News Update"** workflow

## Step 3: Run Your First Update (30 seconds)

1. Click on **"Manual News Update"**
2. Click **"Run workflow"** (right side)
3. Select `hourly` from the dropdown
4. Click green **"Run workflow"** button
5. Wait 2-3 minutes for completion

## Step 4: View Your Reports! (30 seconds)

1. Go back to your repository home
2. Click on the **`reports/`** folder
3. You'll see markdown files with your news!
4. Click any `.md` file to view it

## That's It! 🎉

Your news aggregator is now running automatically:
- **Every hour** from 8 AM - 6 PM EST
- **Daily summary** at 9:00 AM EST

## View Reports Anytime

Reports are saved in the `/reports` folder:
```
reports/
├── hourly_2026-01-21_14-00.md          ← Hourly updates
├── overnight_summary_2026-01-21.md      ← Daily summaries
└── full_report_2026-01-21_09-00.md      ← Complete reports
```

## Manual Triggers

Trigger anytime via **Actions** tab:
- Click **"Manual News Update"**
- Click **"Run workflow"**
- Select command (hourly/overnight/cleanup)

## Troubleshooting

**No reports generated?**
- Check that API keys are added to GitHub Secrets
- Verify secrets are named exactly: `NEWSAPI_KEY` and `PROPUBLICA_API_KEY`
- Check workflow logs in Actions tab

**"Resource not accessible"?**
- Go to **Settings** → **Actions** → **General**
- Set "Workflow permissions" to "Read and write permissions"

## Optional: Add Twitter & Reddit

Add these secrets for social media integration:
- `TWITTER_BEARER_TOKEN`
- `REDDIT_CLIENT_ID`
- `REDDIT_CLIENT_SECRET`

---

**Need more details?** See `GITHUB_ACTIONS_SETUP.md` for the complete guide.

**Running locally instead?** See `SETUP_GUIDE.md` for local installation.
