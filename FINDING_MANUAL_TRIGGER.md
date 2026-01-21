# Finding the Manual Trigger Button - Visual Guide

## Where to Find It

```
GitHub Repository
    ↓
Actions Tab (top navigation)
    ↓
Left Sidebar → "Manual News Update"
    ↓
Right Side → "Run workflow" button
```

## Detailed Steps with What You'll See

### Step 1: Navigate to Actions Tab
```
Your Repo → Actions (top menu bar)
```

You should see:
```
┌─────────────────────────────────────────────────┐
│  < > Code   Issues   Pull requests   Actions   │
│                                        ↑        │
│                                   CLICK HERE    │
└─────────────────────────────────────────────────┘
```

### Step 2: Left Sidebar - All Workflows
```
┌──────────────────────────┐
│ All workflows            │
│                          │
│ ○ Daily News Aggregation │
│ ○ Manual News Update ←── CLICK THIS
│                          │
└──────────────────────────┘
```

### Step 3: Run Workflow Button
```
┌────────────────────────────────────────────────────┐
│ Manual News Update                 [Run workflow] │←─ CLICK HERE
│                                                    │
│ This workflow has a workflow_dispatch event       │
│ trigger.                                          │
└────────────────────────────────────────────────────┘
```

### Step 4: Workflow Dispatch Form
After clicking "Run workflow", you'll see:

```
┌────────────────────────────────────────┐
│ Use workflow from                      │
│ Branch: main                       ▼   │
│                                        │
│ Select command to run                  │
│ ○ hourly                           ▼   │
│                                        │
│         [Run workflow]                 │←─ CLICK TO START
└────────────────────────────────────────┘
```

## If You Don't See "Run workflow" Button

### Reason 1: Workflows Not Enabled Yet

You'll see this message:
```
┌────────────────────────────────────────────────┐
│  Workflows aren't being run on this repository │
│                                                │
│  [I understand my workflows, go ahead and      │
│   enable them]                                 │
└────────────────────────────────────────────────┘
```

**Solution**: Click the green button to enable workflows

### Reason 2: Branch Doesn't Have Workflows

Make sure you're on the branch with the workflows:
```
Branch selector → claude/daily-news-legislation-report-u7frd
```

### Reason 3: Need to Refresh Page

Sometimes GitHub needs a refresh:
- Press F5 or Ctrl+R (Cmd+R on Mac)
- Or navigate away and back to Actions tab

## Alternative: Use GitHub CLI

If you have GitHub CLI installed:

```bash
# List available workflows
gh workflow list

# Run the manual trigger
gh workflow run manual-trigger.yml -f command=hourly

# Watch it run
gh run watch
```

## Still Can't Find It?

### Check Your Repository URL

Make sure you're at:
```
https://github.com/realkevinlee4/Claude-Test
```

### Check Branch

The workflows are on branch:
```
claude/daily-news-legislation-report-u7frd
```

### Verify Workflows Exist

Go to:
```
https://github.com/realkevinlee4/Claude-Test/tree/claude/daily-news-legislation-report-u7frd/.github/workflows
```

You should see:
- manual-trigger.yml
- news-aggregation.yml

## What Happens After You Click "Run workflow"

1. Workflow starts (shows yellow circle)
2. Takes 2-3 minutes to complete
3. Shows green checkmark when done
4. Reports appear in `/reports` folder
5. You can download artifacts

## Quick Test

Try this URL directly (replace with your repo):
```
https://github.com/realkevinlee4/Claude-Test/actions/workflows/manual-trigger.yml
```

This should take you directly to the manual trigger workflow page where you'll see the "Run workflow" button.
