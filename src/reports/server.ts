import express from 'express';
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import config from '../config/config';

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '../../public')));

// Get list of all reports
app.get('/api/reports', (req, res) => {
  try {
    const reportsDir = config.reportsDir;

    if (!fs.existsSync(reportsDir)) {
      return res.json({ reports: [] });
    }

    const files = fs.readdirSync(reportsDir)
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const filePath = path.join(reportsDir, file);
        const stats = fs.statSync(filePath);

        // Parse filename to determine type and date
        let type = 'other';
        if (file.startsWith('hourly_')) type = 'hourly';
        else if (file.startsWith('overnight_summary_')) type = 'overnight';
        else if (file.startsWith('full_report_')) type = 'full';

        return {
          name: file,
          path: file,
          type,
          size: stats.size,
          modified: stats.mtime,
          created: stats.birthtime
        };
      })
      .sort((a, b) => b.modified.getTime() - a.modified.getTime());

    res.json({ reports: files });
  } catch (error) {
    console.error('Error listing reports:', error);
    res.status(500).json({ error: 'Failed to list reports' });
  }
});

// Get specific report content
app.get('/api/reports/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(config.reportsDir, filename);

    if (!fs.existsSync(filePath) || !filename.endsWith('.md')) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const markdown = fs.readFileSync(filePath, 'utf-8');
    const html = marked(markdown);

    res.json({
      filename,
      markdown,
      html,
      path: filePath
    });
  } catch (error) {
    console.error('Error reading report:', error);
    res.status(500).json({ error: 'Failed to read report' });
  }
});

// Get latest report of each type
app.get('/api/reports/latest/:type', (req, res) => {
  try {
    const type = req.params.type;
    const reportsDir = config.reportsDir;

    if (!fs.existsSync(reportsDir)) {
      return res.status(404).json({ error: 'No reports found' });
    }

    const prefix = type === 'hourly' ? 'hourly_' :
                   type === 'overnight' ? 'overnight_summary_' :
                   type === 'full' ? 'full_report_' : '';

    if (!prefix) {
      return res.status(400).json({ error: 'Invalid report type' });
    }

    const files = fs.readdirSync(reportsDir)
      .filter(file => file.startsWith(prefix) && file.endsWith('.md'))
      .sort()
      .reverse();

    if (files.length === 0) {
      return res.status(404).json({ error: 'No reports of this type found' });
    }

    const latestFile = files[0];
    const filePath = path.join(reportsDir, latestFile);
    const markdown = fs.readFileSync(filePath, 'utf-8');
    const html = marked(markdown);

    res.json({
      filename: latestFile,
      markdown,
      html,
      path: filePath
    });
  } catch (error) {
    console.error('Error reading latest report:', error);
    res.status(500).json({ error: 'Failed to read report' });
  }
});

// System status endpoint
app.get('/api/status', (req, res) => {
  try {
    const reportsDir = config.reportsDir;
    const dbPath = config.databasePath;

    const reportCount = fs.existsSync(reportsDir)
      ? fs.readdirSync(reportsDir).filter(f => f.endsWith('.md')).length
      : 0;

    const dbExists = fs.existsSync(dbPath);
    const dbSize = dbExists ? fs.statSync(dbPath).size : 0;

    res.json({
      status: 'running',
      reports: {
        count: reportCount,
        directory: reportsDir
      },
      database: {
        exists: dbExists,
        size: dbSize,
        path: dbPath
      },
      config: {
        timezone: config.timezone,
        apiKeys: {
          newsApi: !!config.newsApiKey,
          propublica: !!config.propublicaApiKey && config.propublicaApiKey !== 'PROPUBLICA_API_KEY',
          twitter: !!config.twitterBearerToken,
          reddit: !!config.redditClientId
        }
      }
    });
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ error: 'Failed to get status' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
export function startReportServer(): void {
  app.listen(PORT, () => {
    console.log(`\n📊 Reports Server started!`);
    console.log(`   View reports at: http://localhost:${PORT}`);
    console.log(`   API endpoint: http://localhost:${PORT}/api/reports\n`);
  });
}

export default app;
