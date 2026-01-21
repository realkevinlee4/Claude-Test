# Web Interface Guide - Reports Tab

The Daily News Aggregator now includes a beautiful web-based reports viewer!

## 🌐 What Was Added

### 1. Web Server (`src/reports/server.ts`)
- Express.js server serving reports via REST API
- Runs on port 3000 (configurable via PORT environment variable)
- Real-time report access with automatic refresh

### 2. Web Interface (`public/index.html`)
- Beautiful, modern UI with tabbed navigation
- Four main tabs:
  - **All Reports** - See everything at once
  - **Hourly Updates** - Quick updates from 8 AM - 6 PM EST
  - **Overnight Summaries** - Daily morning summaries
  - **Full Reports** - Comprehensive daily reports
- Click any report card to view it in formatted Markdown
- Auto-refresh every 5 minutes
- System status indicator

### 3. API Endpoints

#### GET `/api/reports`
Returns list of all reports with metadata:
```json
{
  "reports": [
    {
      "name": "hourly_2026-01-21_14-00.md",
      "path": "hourly_2026-01-21_14-00.md",
      "type": "hourly",
      "size": 12345,
      "modified": "2026-01-21T19:00:00.000Z",
      "created": "2026-01-21T19:00:00.000Z"
    }
  ]
}
```

#### GET `/api/reports/:filename`
Returns specific report content:
```json
{
  "filename": "hourly_2026-01-21_14-00.md",
  "markdown": "# Report content...",
  "html": "<h1>Report content...</h1>",
  "path": "./reports/hourly_2026-01-21_14-00.md"
}
```

#### GET `/api/reports/latest/:type`
Get latest report of type (hourly, overnight, full):
```json
{
  "filename": "latest_report.md",
  "markdown": "...",
  "html": "..."
}
```

#### GET `/api/status`
System status information:
```json
{
  "status": "running",
  "reports": {
    "count": 42,
    "directory": "./reports"
  },
  "database": {
    "exists": true,
    "size": 1048576,
    "path": "./data/news.db"
  },
  "config": {
    "timezone": "America/New_York",
    "apiKeys": {
      "newsApi": true,
      "propublica": false,
      "twitter": true,
      "reddit": false
    }
  }
}
```

## 🚀 How to Use

### Start with Web Interface

```bash
# Start scheduler with web interface
npm start web

# Or use the shortcut
npm run start:web
```

### Access the Interface

Open your browser to:
```
http://localhost:3000
```

You'll see:
- ✅ System status (running indicator)
- ✅ Total report count
- ✅ Last update timestamp
- ✅ Refresh button
- ✅ Four tabbed sections

### Navigate Reports

1. **Browse by Tab**
   - Click tabs to filter by report type
   - See cards with report metadata
   - Color-coded by type (blue=hourly, yellow=overnight, green=full)

2. **View a Report**
   - Click any report card
   - View beautifully formatted HTML
   - Links are clickable
   - Click "← Back to Reports" to return

3. **Refresh Data**
   - Click "🔄 Refresh" button
   - Or wait for auto-refresh (every 5 minutes)

## 🎨 Features

### Beautiful Design
- Modern gradient header
- Card-based layout
- Smooth animations
- Responsive design
- Professional styling

### Real-time Updates
- Green pulsing indicator shows system is running
- Auto-refresh every 5 minutes
- Manual refresh button
- Live report count

### Smart Organization
- Reports sorted by newest first
- Grouped by type
- Metadata displayed (date, time, size)
- Empty states for missing reports

### Formatted Display
- Markdown converted to HTML
- Syntax highlighting
- Proper heading hierarchy
- Clickable external links
- Horizontal rules

## 📊 Report Types Explained

### Hourly Reports
**Filename**: `hourly_YYYY-MM-DD_HH-mm.md`

**Generated**: Every hour from 8 AM - 6 PM EST

**Contains**:
- Articles from the past hour
- Grouped by category
- Quick overview of recent news
- Article count summary

**Best For**: Staying up-to-date throughout the day

### Overnight Summaries
**Filename**: `overnight_summary_YYYY-MM-DD.md`

**Generated**: Daily at 9:00 AM EST

**Contains**:
- Articles from previous 12 hours (overnight)
- Executive summary with statistics
- Articles by category breakdown
- Top 10 articles per category

**Best For**: Morning catch-up on overnight events

### Full Reports
**Filename**: `full_report_YYYY-MM-DD_HH-mm.md`

**Generated**: With overnight summary at 9:00 AM EST

**Contains**:
- Complete view of all tracked categories
- Up to 20 articles per category
- Table of contents
- Report statistics
- Database info

**Best For**: Comprehensive daily review

## 🐛 Bug Fixes Applied

### 1. NewsAPI Free Tier Compatibility
**Issue**: 403 errors from NewsAPI /everything endpoint

**Fix**:
- Implemented 1-hour caching
- Use /top-headlines (free tier endpoint)
- Client-side keyword filtering
- Reduced API calls from 6+ to 1 per hour

**Result**: Compatible with free tier (100 requests/day)

### 2. ProPublica Placeholder Detection
**Issue**: API calls made with placeholder key

**Fix**:
- Check for placeholder strings before API calls
- Silent skip if key is 'PROPUBLICA_API_KEY'
- No error spam in logs

**Result**: Graceful handling of missing keys

### 3. Reddit Server Errors
**Issue**: 500 errors from Reddit API

**Fix**:
- Error handling for all Reddit calls
- Continue aggregation even if Reddit fails
- Non-blocking errors

**Result**: System works even when Reddit is down

### 4. Express Types
**Issue**: TypeScript errors for Express

**Fix**:
- Added `express` to dependencies
- Added `@types/express` to devDependencies
- Proper type definitions

**Result**: Clean TypeScript compilation

## 🔧 Configuration

### Change Port

Set PORT environment variable:
```bash
PORT=8080 npm start web
```

Or in `.env`:
```env
PORT=8080
```

### Customize Auto-Refresh

Edit `public/index.html` line 380:
```javascript
// Change 5 * 60 * 1000 to your preferred interval (milliseconds)
setInterval(loadReports, 5 * 60 * 1000);  // Current: 5 minutes
```

### API Endpoint URLs

If running on a different host/port, update fetch URLs in `public/index.html`:
```javascript
const response = await fetch('/api/reports');
// Change to: fetch('http://your-host:port/api/reports')
```

## 🚀 Production Deployment

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start with web interface
pm2 start dist/index.js --name news-aggregator -- web

# View logs
pm2 logs news-aggregator

# Stop
pm2 stop news-aggregator
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:web"]
```

Build and run:
```bash
docker build -t news-aggregator .
docker run -p 3000:3000 --env-file .env news-aggregator
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name news.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Environment Variables

For production, set:
```env
NODE_ENV=production
PORT=3000
NEWSAPI_KEY=your_key
PROPUBLICA_API_KEY=your_key
TWITTER_BEARER_TOKEN=your_token
```

## 📱 Mobile Responsive

The interface is fully responsive and works on:
- ✅ Desktop (1920x1080 and above)
- ✅ Laptop (1366x768)
- ✅ Tablet (768x1024)
- ✅ Mobile (375x667 and above)

Features adjust automatically:
- Card grid collapses to single column on mobile
- Status bar wraps on smaller screens
- Touch-friendly buttons and cards

## 🎯 Tips & Tricks

### Keyboard Shortcuts
- `Ctrl+R` or `F5` - Refresh page
- `Esc` - Close report viewer (if implemented)

### Bookmarklets
Save these as bookmarks for quick access:

**Latest Hourly Report**:
```javascript
javascript:void(window.open('http://localhost:3000?view=latest&type=hourly'))
```

**Latest Overnight Summary**:
```javascript
javascript:void(window.open('http://localhost:3000?view=latest&type=overnight'))
```

### API in Your Apps

Use the API endpoints in your own applications:

```javascript
// Fetch all reports
const response = await fetch('http://localhost:3000/api/reports');
const data = await response.json();
console.log(data.reports);

// Get latest overnight summary
const latest = await fetch('http://localhost:3000/api/reports/latest/overnight');
const report = await latest.json();
console.log(report.html);
```

### RSS Feed (Future Enhancement)

Consider adding RSS feed generation:
```javascript
app.get('/rss', (req, res) => {
  // Generate RSS feed from reports
  res.type('application/rss+xml');
  res.send(rssXml);
});
```

## 🔐 Security Considerations

### For Production

1. **Add Authentication**
   ```javascript
   app.use((req, res, next) => {
     const auth = req.headers.authorization;
     if (auth === 'Bearer YOUR_SECRET_TOKEN') {
       next();
     } else {
       res.status(401).json({ error: 'Unauthorized' });
     }
   });
   ```

2. **Rate Limiting**
   ```javascript
   import rateLimit from 'express-rate-limit';

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });

   app.use(limiter);
   ```

3. **CORS Configuration**
   ```javascript
   import cors from 'cors';

   app.use(cors({
     origin: 'https://yourdomain.com'
   }));
   ```

4. **HTTPS Only**
   - Use reverse proxy (Nginx)
   - Or use Express HTTPS:
   ```javascript
   import https from 'https';
   import fs from 'fs';

   const options = {
     key: fs.readFileSync('key.pem'),
     cert: fs.readFileSync('cert.pem')
   };

   https.createServer(options, app).listen(443);
   ```

## 🎉 Summary

You now have:
- ✅ Beautiful web interface for viewing reports
- ✅ Four organized tabs for different report types
- ✅ Real-time updates and auto-refresh
- ✅ REST API for integration
- ✅ Mobile-responsive design
- ✅ All bugs fixed (NewsAPI, ProPublica, Reddit)
- ✅ Production-ready setup

Enjoy your new **Reports Tab**! 🚀📰

---

**Need Help?**
- Check logs: `pm2 logs` or console output
- Verify reports exist: `ls -la reports/`
- Test API: `curl http://localhost:3000/api/status`
- Rebuild: `npm run build`
