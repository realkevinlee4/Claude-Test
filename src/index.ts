#!/usr/bin/env node

import Scheduler from './services/scheduler';
import { startReportServer } from './reports/server';
import EmailService from './services/email';
import NewsDatabase from './models/database';
import config from './config/config';

const scheduler = new Scheduler();

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

function printHelp(): void {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║           Daily News Aggregator - Command Line Tool           ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  npm start [command]

COMMANDS:
  start              Start the automated scheduler (default)
  web                Start scheduler with web interface (port 3000)
  hourly             Run a single hourly update
  overnight          Generate overnight summary
  cleanup            Clean old articles and reports
  help               Show this help message

DESCRIPTION:
  This tool automatically aggregates news from multiple sources:
  - Traditional news media (NewsAPI)
  - Social media (Twitter, Reddit)
  - US Congress data (ProPublica Congress API)

  Categories tracked:
  • AI Projects and News
  • US Congress Laws and Bills
  • Key Hearings on Capitol Hill
  • Introduced Bills (Senate & House)
  • President Trump's Actions
  • Social Media Controversies
  • Internal Ops (Influenceable, Liam/Cam Rafizadeh mentions)
  • Russia-Ukraine Updates
  • Iran Updates
  • Foreign Affairs

SCHEDULE:
  • Hourly updates: 8 AM - 6 PM EST
  • Overnight summary: 9:00 AM EST daily
  • Automatic cleanup: 2:00 AM EST daily

CONFIGURATION:
  Edit .env file to configure API keys and settings.
  See .env.example for required variables.

REPORTS:
  Reports are saved to: ${config.reportsDir}
  Database location: ${config.databasePath}

EXAMPLES:
  npm start                    # Start the scheduler
  npm start web                # Start with web interface
  npm start hourly             # Run hourly update once
  npm start overnight          # Generate overnight summary
  npm start cleanup            # Clean old data

For more information, see README.md
`);
}

async function main(): Promise<void> {
  // Check if API keys are configured
  const hasNewsAPI = !!config.newsApiKey;
  const hasProPublica = !!config.propublicaApiKey;

  if (!hasNewsAPI && !hasProPublica) {
    console.error(`
⚠️  WARNING: No API keys configured!

At minimum, you need either:
- NEWSAPI_KEY (get free at https://newsapi.org/)
- PROPUBLICA_API_KEY (get free at https://www.propublica.org/datastore/api/propublica-congress-api)

Optional but recommended:
- TWITTER_BEARER_TOKEN (for Twitter data)
- REDDIT_CLIENT_ID & REDDIT_CLIENT_SECRET (for Reddit data)

Copy .env.example to .env and add your API keys.
`);
    process.exit(1);
  }

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║           Daily News Aggregator - System Status                ║
╚════════════════════════════════════════════════════════════════╝

API Configuration:
  ✓ NewsAPI:           ${hasNewsAPI ? '✅ Configured' : '❌ Not configured'}
  ✓ ProPublica API:    ${hasProPublica ? '✅ Configured' : '❌ Not configured'}
  ✓ Twitter API:       ${config.twitterBearerToken ? '✅ Configured' : '⚠️  Optional - Not configured'}
  ✓ Reddit API:        ${config.redditClientId ? '✅ Configured' : '⚠️  Optional - Not configured'}

Storage:
  ✓ Reports:           ${config.reportsDir}
  ✓ Database:          ${config.databasePath}

Timezone:              ${config.timezone}
`);

  switch (command) {
    case 'hourly':
      await scheduler.triggerHourlyUpdate();
      process.exit(0);
      break;

    case 'overnight':
      await scheduler.triggerOvernightSummary();
      process.exit(0);
      break;

    case 'cleanup':
      await scheduler.triggerCleanup();
      process.exit(0);
      break;

    case 'help':
    case '--help':
    case '-h':
      printHelp();
      process.exit(0);
      break;

    case 'web':
      // Start scheduler with web interface
      scheduler.start();
      startReportServer();
      break;

    case 'start':
    case undefined:
      // Start the scheduler
      scheduler.start();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.log('Run "npm start help" for usage information.');
      process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n📡 Received SIGINT signal...');
  scheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n📡 Received SIGTERM signal...');
  scheduler.stop();
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  scheduler.stop();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the application
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
