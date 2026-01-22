import cron from 'node-cron';
import { formatInTimeZone } from 'date-fns-tz';
import NewsDatabase from '../models/database';
import NewsAggregator from './news/aggregator';
import ReportGenerator from '../reports/generator';
import EmailService from './email';
import config from '../config/config';

export class Scheduler {
  private db: NewsDatabase;
  private aggregator: NewsAggregator;
  private reportGenerator: ReportGenerator;
  private emailService: EmailService;
  private hourlyTask?: cron.ScheduledTask;
  private overnightTask?: cron.ScheduledTask;
  private cleanupTask?: cron.ScheduledTask;

  constructor() {
    this.db = new NewsDatabase();
    this.aggregator = new NewsAggregator(this.db);
    this.reportGenerator = new ReportGenerator(this.db);
    this.emailService = new EmailService(this.db);
  }

  private getCurrentTime(): string {
    return formatInTimeZone(new Date(), config.timezone, 'yyyy-MM-dd HH:mm:ss zzz');
  }

  private async runHourlyUpdate(): Promise<void> {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Hourly Update Started: ${this.getCurrentTime()}`);
    console.log('='.repeat(60));

    try {
      // Aggregate news
      console.log('\n📰 Aggregating news from all sources...');
      const newArticles = await this.aggregator.aggregateAll();
      console.log(`✅ Collected ${newArticles} new articles`);

      // Generate hourly report
      console.log('\n📝 Generating hourly report...');
      const reportPath = this.reportGenerator.generateHourlyReport();
      console.log(`✅ Report saved: ${reportPath}`);

      // Send email if configured and enabled
      if (config.email.enabled && config.email.sendHourlyUpdates && config.email.recipients.length > 0) {
        console.log('\n📧 Sending hourly email update...');
        const emailSent = await this.emailService.sendHourlyUpdate(config.email.recipients);
        if (emailSent) {
          console.log(`✅ Email sent to ${config.email.recipients.length} recipient(s)`);
        }
      }

      console.log('\n' + '='.repeat(60));
      console.log(`Hourly Update Completed: ${this.getCurrentTime()}`);
      console.log('='.repeat(60) + '\n');
    } catch (error) {
      console.error('\n❌ Error during hourly update:', error);
    }
  }

  private async runOvernightSummary(): Promise<void> {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Overnight Summary Started: ${this.getCurrentTime()}`);
    console.log('='.repeat(60));

    try {
      // Run a full aggregation first
      console.log('\n📰 Running morning aggregation...');
      const newArticles = await this.aggregator.aggregateAll();
      console.log(`✅ Collected ${newArticles} new articles`);

      // Generate overnight summary
      console.log('\n📋 Generating overnight summary...');
      const summaryPath = this.reportGenerator.generateOvernightSummary();
      console.log(`✅ Summary saved: ${summaryPath}`);

      // Also generate a full report
      console.log('\n📊 Generating full daily report...');
      const fullReportPath = this.reportGenerator.generateFullReport();
      console.log(`✅ Full report saved: ${fullReportPath}`);

      // Send email if configured and enabled
      if (config.email.enabled && config.email.sendOvernightSummary && config.email.recipients.length > 0) {
        console.log('\n📧 Sending overnight summary email...');
        const emailSent = await this.emailService.sendOvernightSummary(config.email.recipients);
        if (emailSent) {
          console.log(`✅ Email sent to ${config.email.recipients.length} recipient(s)`);
        }
      }

      console.log('\n' + '='.repeat(60));
      console.log(`Overnight Summary Completed: ${this.getCurrentTime()}`);
      console.log('='.repeat(60) + '\n');
    } catch (error) {
      console.error('\n❌ Error during overnight summary:', error);
    }
  }

  private async runCleanup(): Promise<void> {
    console.log(`\n🧹 Running cleanup: ${this.getCurrentTime()}`);

    try {
      // Clean old articles (keep 30 days)
      const deletedArticles = this.db.cleanOldArticles(30);
      console.log(`✅ Cleaned ${deletedArticles} old articles from database`);

      // Clean old reports (keep 7 days)
      const deletedReports = this.reportGenerator.cleanOldReports(7);
      console.log(`✅ Cleaned ${deletedReports} old reports\n`);
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }

  start(): void {
    console.log('\n' + '='.repeat(60));
    console.log('Daily News Aggregator - Starting Scheduler');
    console.log('='.repeat(60));
    console.log(`Timezone: ${config.timezone}`);
    console.log(`Hourly Updates: 8 AM - 6 PM EST (every hour)`);
    console.log(`Overnight Summary: 9:00 AM EST (daily)`);
    console.log(`Started at: ${this.getCurrentTime()}`);
    console.log('='.repeat(60) + '\n');

    // Hourly updates (8 AM - 6 PM EST)
    // Cron: 0 8-18 * * * = At minute 0 past every hour from 8 through 18
    this.hourlyTask = cron.schedule(
      config.hourlySchedule,
      () => this.runHourlyUpdate(),
      {
        timezone: config.timezone
      }
    );
    console.log('✅ Hourly update scheduler started (8 AM - 6 PM EST)');

    // Overnight summary (9:00 AM EST daily)
    // Cron: 0 9 * * * = At 09:00 every day
    this.overnightTask = cron.schedule(
      config.overnightSummarySchedule,
      () => this.runOvernightSummary(),
      {
        timezone: config.timezone
      }
    );
    console.log('✅ Overnight summary scheduler started (9:00 AM EST daily)');

    // Cleanup task (runs at 2 AM EST daily)
    this.cleanupTask = cron.schedule(
      '0 2 * * *',
      () => this.runCleanup(),
      {
        timezone: config.timezone
      }
    );
    console.log('✅ Cleanup scheduler started (2:00 AM EST daily)');

    console.log('\n🚀 All schedulers are running. Press Ctrl+C to stop.\n');

    // Run an initial aggregation on startup
    console.log('🔄 Running initial aggregation...\n');
    this.runHourlyUpdate().then(() => {
      console.log('✅ Initial aggregation complete\n');
    });
  }

  stop(): void {
    console.log('\n🛑 Stopping schedulers...');

    if (this.hourlyTask) {
      this.hourlyTask.stop();
      console.log('✅ Hourly scheduler stopped');
    }

    if (this.overnightTask) {
      this.overnightTask.stop();
      console.log('✅ Overnight summary scheduler stopped');
    }

    if (this.cleanupTask) {
      this.cleanupTask.stop();
      console.log('✅ Cleanup scheduler stopped');
    }

    this.db.close();
    console.log('✅ Database connection closed');
    console.log('\n👋 Scheduler stopped successfully\n');
  }

  // Manual triggers for testing
  async triggerHourlyUpdate(): Promise<void> {
    console.log('🔄 Manually triggering hourly update...\n');
    await this.runHourlyUpdate();
  }

  async triggerOvernightSummary(): Promise<void> {
    console.log('🔄 Manually triggering overnight summary...\n');
    await this.runOvernightSummary();
  }

  async triggerCleanup(): Promise<void> {
    console.log('🔄 Manually triggering cleanup...\n');
    await this.runCleanup();
  }
}

export default Scheduler;
