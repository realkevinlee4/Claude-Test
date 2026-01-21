import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { NewsArticle, NewsCategory } from '../types';
import NewsDatabase from '../models/database';
import config from '../config/config';

export class ReportGenerator {
  private db: NewsDatabase;
  private reportsDir: string;

  constructor(db: NewsDatabase) {
    this.db = db;
    this.reportsDir = config.reportsDir;
    this.ensureReportsDirectory();
  }

  private ensureReportsDirectory(): void {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  private getCategoryArticles(category: NewsCategory): NewsArticle[] {
    return this.db.getArticlesByCategory(category, config.report.maxArticlesPerCategory);
  }

  private formatArticleMarkdown(article: NewsArticle, index: number): string {
    const time = formatInTimeZone(article.publishedAt, config.timezone, 'MMM dd, yyyy HH:mm');

    let markdown = `### ${index}. ${article.title}\n\n`;
    markdown += `**Source:** ${article.source} | **Published:** ${time}\n\n`;

    if (article.description) {
      markdown += `${article.description}\n\n`;
    }

    markdown += `[Read More](${article.url})\n\n`;

    if (article.author) {
      markdown += `*Author: ${article.author}*\n\n`;
    }

    markdown += `---\n\n`;

    return markdown;
  }

  generateHourlyReport(): string {
    const now = new Date();
    const timestamp = formatInTimeZone(now, config.timezone, 'yyyy-MM-dd_HH-mm');
    const displayTime = formatInTimeZone(now, config.timezone, 'EEEE, MMMM dd, yyyy - h:mm a zzz');

    let markdown = `# Hourly News Report\n\n`;
    markdown += `**Generated:** ${displayTime}\n\n`;
    markdown += `---\n\n`;

    // Get recent articles (last hour)
    const recentArticles = this.db.getRecentArticles(1);

    if (recentArticles.length === 0) {
      markdown += `*No new articles in the past hour.*\n\n`;
    } else {
      markdown += `## Summary\n\n`;
      markdown += `**${recentArticles.length}** new articles collected in the past hour.\n\n`;
      markdown += `---\n\n`;

      // Group by category
      const byCategory = new Map<NewsCategory, NewsArticle[]>();
      recentArticles.forEach(article => {
        if (!byCategory.has(article.category)) {
          byCategory.set(article.category, []);
        }
        byCategory.get(article.category)!.push(article);
      });

      // Generate sections for each category
      byCategory.forEach((articles, category) => {
        markdown += `## ${category}\n\n`;
        markdown += `*${articles.length} article${articles.length > 1 ? 's' : ''}*\n\n`;

        articles.forEach((article, idx) => {
          markdown += this.formatArticleMarkdown(article, idx + 1);
        });
      });
    }

    // Save report
    const filename = `hourly_${timestamp}.md`;
    const filepath = path.join(this.reportsDir, filename);
    fs.writeFileSync(filepath, markdown);

    console.log(`Hourly report generated: ${filepath}`);
    return filepath;
  }

  generateOvernightSummary(): string {
    const now = new Date();
    const timestamp = formatInTimeZone(now, config.timezone, 'yyyy-MM-dd');
    const displayTime = formatInTimeZone(now, config.timezone, 'EEEE, MMMM dd, yyyy');

    let markdown = `# Overnight News Summary\n\n`;
    markdown += `**Date:** ${displayTime}\n\n`;
    markdown += `**Period:** Previous ${config.report.overnightSummaryHours} hours\n\n`;
    markdown += `---\n\n`;

    // Get articles from overnight period
    const overnightArticles = this.db.getRecentArticles(config.report.overnightSummaryHours);

    markdown += `## Executive Summary\n\n`;
    markdown += `**Total Articles:** ${overnightArticles.length}\n\n`;

    // Count by category
    const categoryCounts = new Map<NewsCategory, number>();
    overnightArticles.forEach(article => {
      categoryCounts.set(article.category, (categoryCounts.get(article.category) || 0) + 1);
    });

    markdown += `### Articles by Category\n\n`;
    categoryCounts.forEach((count, category) => {
      markdown += `- **${category}:** ${count} article${count > 1 ? 's' : ''}\n`;
    });
    markdown += `\n---\n\n`;

    // Generate detailed sections for each category
    Object.values(NewsCategory).forEach(category => {
      const articles = this.getCategoryArticles(category);

      if (articles.length > 0) {
        markdown += `## ${category}\n\n`;
        markdown += `*${articles.length} article${articles.length > 1 ? 's' : ''}*\n\n`;

        articles.slice(0, 10).forEach((article, idx) => {
          markdown += this.formatArticleMarkdown(article, idx + 1);
        });

        if (articles.length > 10) {
          markdown += `*... and ${articles.length - 10} more articles in this category*\n\n`;
        }
      }
    });

    // Save report
    const filename = `overnight_summary_${timestamp}.md`;
    const filepath = path.join(this.reportsDir, filename);
    fs.writeFileSync(filepath, markdown);

    console.log(`Overnight summary generated: ${filepath}`);
    return filepath;
  }

  generateFullReport(): string {
    const now = new Date();
    const timestamp = formatInTimeZone(now, config.timezone, 'yyyy-MM-dd_HH-mm');
    const displayTime = formatInTimeZone(now, config.timezone, 'EEEE, MMMM dd, yyyy - h:mm a zzz');

    let markdown = `# Complete Daily News Report\n\n`;
    markdown += `**Generated:** ${displayTime}\n\n`;
    markdown += `---\n\n`;

    markdown += `## Table of Contents\n\n`;
    Object.values(NewsCategory).forEach(category => {
      const anchor = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      markdown += `- [${category}](#${anchor})\n`;
    });
    markdown += `\n---\n\n`;

    // Generate sections for each category
    Object.values(NewsCategory).forEach(category => {
      const articles = this.getCategoryArticles(category);

      markdown += `## ${category}\n\n`;

      if (articles.length === 0) {
        markdown += `*No articles available in this category.*\n\n`;
      } else {
        markdown += `*${articles.length} article${articles.length > 1 ? 's' : ''}*\n\n`;

        articles.forEach((article, idx) => {
          markdown += this.formatArticleMarkdown(article, idx + 1);
        });
      }

      markdown += `---\n\n`;
    });

    // Add footer with stats
    markdown += `## Report Statistics\n\n`;
    markdown += `- **Total Articles in Database:** ${this.db.getArticleCount()}\n`;
    markdown += `- **Report Generated:** ${displayTime}\n`;
    markdown += `- **Next Update:** Hourly (8 AM - 6 PM EST)\n`;
    markdown += `- **Next Overnight Summary:** Tomorrow at 9:00 AM EST\n\n`;

    // Save report
    const filename = `full_report_${timestamp}.md`;
    const filepath = path.join(this.reportsDir, filename);
    fs.writeFileSync(filepath, markdown);

    console.log(`Full report generated: ${filepath}`);
    return filepath;
  }

  generateCategoryReport(category: NewsCategory): string {
    const now = new Date();
    const timestamp = formatInTimeZone(now, config.timezone, 'yyyy-MM-dd_HH-mm');
    const displayTime = formatInTimeZone(now, config.timezone, 'EEEE, MMMM dd, yyyy - h:mm a zzz');

    let markdown = `# ${category} - News Report\n\n`;
    markdown += `**Generated:** ${displayTime}\n\n`;
    markdown += `---\n\n`;

    const articles = this.getCategoryArticles(category);

    if (articles.length === 0) {
      markdown += `*No articles available in this category.*\n\n`;
    } else {
      markdown += `**Total Articles:** ${articles.length}\n\n`;
      markdown += `---\n\n`;

      articles.forEach((article, idx) => {
        markdown += this.formatArticleMarkdown(article, idx + 1);
      });
    }

    // Save report
    const categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const filename = `${categorySlug}_${timestamp}.md`;
    const filepath = path.join(this.reportsDir, filename);
    fs.writeFileSync(filepath, markdown);

    console.log(`Category report generated: ${filepath}`);
    return filepath;
  }

  cleanOldReports(daysToKeep: number = 7): number {
    const files = fs.readdirSync(this.reportsDir);
    const now = Date.now();
    const maxAge = daysToKeep * 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    files.forEach(file => {
      const filepath = path.join(this.reportsDir, file);
      const stats = fs.statSync(filepath);
      const age = now - stats.mtimeMs;

      if (age > maxAge) {
        fs.unlinkSync(filepath);
        deletedCount++;
      }
    });

    console.log(`Cleaned ${deletedCount} old reports`);
    return deletedCount;
  }
}

export default ReportGenerator;
