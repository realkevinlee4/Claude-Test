import nodemailer from 'nodemailer';
import { NewsArticle, NewsCategory } from '../types';
import NewsDatabase from '../models/database';
import config from '../config/config';
import { formatInTimeZone } from 'date-fns-tz';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private db: NewsDatabase;

  constructor(db: NewsDatabase) {
    this.db = db;
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    };

    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.log('⚠️  Email not configured - skipping email notifications');
      return;
    }

    this.transporter = nodemailer.createTransport(emailConfig);
    console.log('✅ Email service initialized');
  }

  private getCategoryIcon(category: NewsCategory): string {
    const icons: Record<string, string> = {
      'AI Projects and News': '🤖',
      'US Congress Laws and Bills': '🏛️',
      'Key Hearings on Capitol Hill': '⚖️',
      'Introduced Bills - US Senate': '📜',
      'Introduced Bills - US House': '📋',
      'President Trump\'s Actions': '🇺🇸',
      'Social Media Controversies': '💬',
      'Internal Ops': '🔍',
      'Russia-Ukraine Updates': '🌍',
      'Iran Updates': '🏴',
      'Foreign Affairs': '🌐'
    };
    return icons[category] || '📰';
  }

  private getCategoryColor(category: NewsCategory): string {
    const colors: Record<string, string> = {
      'AI Projects and News': '#667eea',
      'US Congress Laws and Bills': '#f59e0b',
      'Key Hearings on Capitol Hill': '#ef4444',
      'Introduced Bills - US Senate': '#3b82f6',
      'Introduced Bills - US House': '#6366f1',
      'President Trump\'s Actions': '#dc2626',
      'Social Media Controversies': '#8b5cf6',
      'Internal Ops': '#06b6d4',
      'Russia-Ukraine Updates': '#10b981',
      'Iran Updates': '#f97316',
      'Foreign Affairs': '#14b8a6'
    };
    return colors[category] || '#6b7280';
  }

  private generateOvernightEmailHTML(articles: Map<NewsCategory, NewsArticle[]>): string {
    const now = new Date();
    const dateStr = formatInTimeZone(now, config.timezone, 'EEEE, MMMM dd, yyyy');

    let totalArticles = 0;
    articles.forEach(arts => totalArticles += arts.length);

    let categorySections = '';

    Object.values(NewsCategory).forEach(category => {
      const categoryArticles = articles.get(category) || [];
      if (categoryArticles.length === 0) return;

      const icon = this.getCategoryIcon(category);
      const color = this.getCategoryColor(category);

      categorySections += `
        <div style="margin-bottom: 40px;">
          <h2 style="color: ${color}; font-size: 24px; margin-bottom: 20px; border-bottom: 3px solid ${color}; padding-bottom: 10px;">
            ${icon} ${category}
            <span style="font-size: 16px; color: #6b7280; font-weight: normal;">(${categoryArticles.length} article${categoryArticles.length > 1 ? 's' : ''})</span>
          </h2>
          ${categoryArticles.slice(0, 5).map((article, idx) => `
            <div style="background: #f9fafb; border-left: 4px solid ${color}; padding: 15px; margin-bottom: 15px; border-radius: 4px;">
              <h3 style="margin: 0 0 8px 0; font-size: 18px;">
                <a href="${article.url}" style="color: #1f2937; text-decoration: none;">${idx + 1}. ${article.title}</a>
              </h3>
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">${article.description || ''}</p>
              <div style="font-size: 12px; color: #9ca3af;">
                <span style="margin-right: 15px;">📰 ${article.source}</span>
                <span style="margin-right: 15px;">🕐 ${formatInTimeZone(article.publishedAt, config.timezone, 'MMM dd, HH:mm')}</span>
                ${article.author ? `<span>✍️ ${article.author}</span>` : ''}
              </div>
            </div>
          `).join('')}
          ${categoryArticles.length > 5 ? `
            <p style="text-align: center; color: #6b7280; font-style: italic;">
              ... and ${categoryArticles.length - 5} more articles in this category
            </p>
          ` : ''}
        </div>
      `;
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily News Summary - ${dateStr}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 800px; margin: 0 auto; background: white;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0 0 10px 0; font-size: 32px;">📰 Daily News Summary</h1>
      <p style="margin: 0; font-size: 18px; opacity: 0.95;">${dateStr}</p>
    </div>

    <!-- Executive Summary -->
    <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px 30px; margin: 20px;">
      <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px;">📊 Executive Summary</h2>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
        <div>
          <div style="font-size: 14px; color: #6b7280;">Total Articles</div>
          <div style="font-size: 28px; font-weight: bold; color: #1f2937;">${totalArticles}</div>
        </div>
        <div>
          <div style="font-size: 14px; color: #6b7280;">Categories</div>
          <div style="font-size: 28px; font-weight: bold; color: #1f2937;">${Array.from(articles.keys()).length}</div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      ${categorySections}
    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">
        Generated by Daily News Aggregator
      </p>
      <p style="color: #9ca3af; margin: 0; font-size: 12px;">
        Next update: Tomorrow at 9:00 AM EST
      </p>
      <div style="margin-top: 15px;">
        <a href="http://localhost:3000" style="display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px;">
          View Web Dashboard
        </a>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  private generateHourlyEmailHTML(articles: NewsArticle[]): string {
    const now = new Date();
    const timeStr = formatInTimeZone(now, config.timezone, 'h:mm a zzz');
    const dateStr = formatInTimeZone(now, config.timezone, 'EEEE, MMMM dd, yyyy');

    // Group by category
    const byCategory = new Map<NewsCategory, NewsArticle[]>();
    articles.forEach(article => {
      if (!byCategory.has(article.category)) {
        byCategory.set(article.category, []);
      }
      byCategory.get(article.category)!.push(article);
    });

    let categorySections = '';
    byCategory.forEach((arts, category) => {
      const icon = this.getCategoryIcon(category);
      const color = this.getCategoryColor(category);

      categorySections += `
        <div style="margin-bottom: 25px;">
          <h3 style="color: ${color}; font-size: 18px; margin-bottom: 12px; border-bottom: 2px solid ${color}; padding-bottom: 6px;">
            ${icon} ${category} (${arts.length})
          </h3>
          ${arts.map((article, idx) => `
            <div style="background: #fafafa; padding: 12px; margin-bottom: 10px; border-radius: 4px; border-left: 3px solid ${color};">
              <a href="${article.url}" style="color: #1f2937; text-decoration: none; font-weight: 500; font-size: 15px;">
                ${idx + 1}. ${article.title}
              </a>
              <div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">
                ${article.source} • ${formatInTimeZone(article.publishedAt, config.timezone, 'HH:mm')}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    });

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hourly Update - ${timeStr}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 700px; margin: 0 auto; background: white;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 25px 20px; text-align: center;">
      <h1 style="margin: 0 0 5px 0; font-size: 24px;">⚡ Hourly News Update</h1>
      <p style="margin: 0; font-size: 14px; opacity: 0.9;">${timeStr} • ${dateStr}</p>
    </div>

    <!-- Summary -->
    ${articles.length > 0 ? `
      <div style="background: #ecfdf5; padding: 15px 20px; margin: 15px; border-radius: 6px;">
        <div style="font-size: 14px; color: #065f46; text-align: center;">
          <strong>${articles.length}</strong> new article${articles.length > 1 ? 's' : ''} in the past hour
        </div>
      </div>
    ` : `
      <div style="background: #f9fafb; padding: 15px 20px; margin: 15px; border-radius: 6px; text-align: center; color: #6b7280;">
        No new articles in the past hour
      </div>
    `}

    <!-- Content -->
    <div style="padding: 20px;">
      ${categorySections}
    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
      <p style="margin: 0;">Next update in 1 hour</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  async sendOvernightSummary(recipients: string[]): Promise<boolean> {
    if (!this.transporter) {
      console.log('Email not configured, skipping overnight summary email');
      return false;
    }

    try {
      // Get articles from overnight
      const articles = this.db.getRecentArticles(config.report.overnightSummaryHours);

      // Group by category
      const byCategory = new Map<NewsCategory, NewsArticle[]>();
      articles.forEach(article => {
        if (!byCategory.has(article.category)) {
          byCategory.set(article.category, []);
        }
        byCategory.get(article.category)!.push(article);
      });

      const html = this.generateOvernightEmailHTML(byCategory);
      const dateStr = formatInTimeZone(new Date(), config.timezone, 'MMMM dd, yyyy');

      const info = await this.transporter.sendMail({
        from: `"Daily News Aggregator" <${process.env.SMTP_USER}>`,
        to: recipients.join(', '),
        subject: `📰 Daily News Summary - ${dateStr}`,
        html
      });

      console.log(`✅ Overnight summary sent to ${recipients.length} recipient(s)`);
      return true;
    } catch (error) {
      console.error('Error sending overnight summary email:', error);
      return false;
    }
  }

  async sendHourlyUpdate(recipients: string[]): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      const articles = this.db.getRecentArticles(1);

      if (articles.length === 0) {
        console.log('No new articles for hourly email, skipping');
        return false;
      }

      const html = this.generateHourlyEmailHTML(articles);
      const timeStr = formatInTimeZone(new Date(), config.timezone, 'h:mm a');

      const info = await this.transporter.sendMail({
        from: `"Daily News Aggregator" <${process.env.SMTP_USER}>`,
        to: recipients.join(', '),
        subject: `⚡ Hourly Update - ${timeStr} (${articles.length} new articles)`,
        html
      });

      console.log(`✅ Hourly update sent to ${recipients.length} recipient(s)`);
      return true;
    } catch (error) {
      console.error('Error sending hourly update email:', error);
      return false;
    }
  }

  async testEmail(recipient: string): Promise<boolean> {
    if (!this.transporter) {
      console.log('Email not configured');
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: `"Daily News Aggregator" <${process.env.SMTP_USER}>`,
        to: recipient,
        subject: '✅ Email Test - Daily News Aggregator',
        html: `
          <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">✅ Email Configuration Successful!</h2>
            <p>Your email service is properly configured and working.</p>
            <p style="color: #6b7280; font-size: 14px;">You will receive:</p>
            <ul>
              <li>📋 Overnight summaries at 9:00 AM EST daily</li>
              <li>⚡ Hourly updates from 8 AM - 6 PM EST (optional)</li>
            </ul>
          </div>
        `
      });

      console.log(`✅ Test email sent to ${recipient}`);
      return true;
    } catch (error) {
      console.error('Error sending test email:', error);
      return false;
    }
  }
}

export default EmailService;
