import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { NewsArticle, NewsCategory } from '../types';
import config from '../config/config';

export class NewsDatabase {
  private db: Database.Database;

  constructor() {
    // Ensure data directory exists
    const dbDir = path.dirname(config.databasePath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new Database(config.databasePath);
    this.initialize();
  }

  private initialize(): void {
    // Create articles table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        url TEXT UNIQUE NOT NULL,
        source TEXT NOT NULL,
        category TEXT NOT NULL,
        published_at TEXT NOT NULL,
        content TEXT,
        author TEXT,
        image_url TEXT,
        sentiment TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index on URL for faster lookups
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_url ON articles(url)
    `);

    // Create index on category and published_at for faster queries
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_category_date ON articles(category, published_at DESC)
    `);

    console.log('Database initialized successfully');
  }

  saveArticle(article: NewsArticle): boolean {
    try {
      const stmt = this.db.prepare(`
        INSERT OR IGNORE INTO articles (
          title, description, url, source, category,
          published_at, content, author, image_url, sentiment
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        article.title,
        article.description,
        article.url,
        article.source,
        article.category,
        article.publishedAt.toISOString(),
        article.content || null,
        article.author || null,
        article.imageUrl || null,
        article.sentiment || null
      );

      return result.changes > 0;
    } catch (error) {
      console.error('Error saving article:', error);
      return false;
    }
  }

  saveArticles(articles: NewsArticle[]): number {
    let savedCount = 0;
    const insert = this.db.transaction((articles: NewsArticle[]) => {
      for (const article of articles) {
        if (this.saveArticle(article)) {
          savedCount++;
        }
      }
    });

    try {
      insert(articles);
    } catch (error) {
      console.error('Error in transaction:', error);
    }

    return savedCount;
  }

  getArticlesByCategory(category: NewsCategory, limit: number = 20): NewsArticle[] {
    const stmt = this.db.prepare(`
      SELECT * FROM articles
      WHERE category = ?
      ORDER BY published_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(category, limit) as any[];
    return rows.map(row => this.rowToArticle(row));
  }

  getRecentArticles(hoursAgo: number = 24): NewsArticle[] {
    const since = new Date();
    since.setHours(since.getHours() - hoursAgo);

    const stmt = this.db.prepare(`
      SELECT * FROM articles
      WHERE published_at >= ?
      ORDER BY published_at DESC
    `);

    const rows = stmt.all(since.toISOString()) as any[];
    return rows.map(row => this.rowToArticle(row));
  }

  getArticlesByDateRange(startDate: Date, endDate: Date): NewsArticle[] {
    const stmt = this.db.prepare(`
      SELECT * FROM articles
      WHERE published_at >= ? AND published_at <= ?
      ORDER BY category, published_at DESC
    `);

    const rows = stmt.all(startDate.toISOString(), endDate.toISOString()) as any[];
    return rows.map(row => this.rowToArticle(row));
  }

  articleExists(url: string): boolean {
    const stmt = this.db.prepare('SELECT 1 FROM articles WHERE url = ? LIMIT 1');
    return stmt.get(url) !== undefined;
  }

  getArticleCount(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM articles');
    const result = stmt.get() as { count: number };
    return result.count;
  }

  cleanOldArticles(daysToKeep: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const stmt = this.db.prepare(`
      DELETE FROM articles WHERE published_at < ?
    `);

    const result = stmt.run(cutoffDate.toISOString());
    return result.changes;
  }

  private rowToArticle(row: any): NewsArticle {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      url: row.url,
      source: row.source,
      category: row.category as NewsCategory,
      publishedAt: new Date(row.published_at),
      content: row.content,
      author: row.author,
      imageUrl: row.image_url,
      sentiment: row.sentiment,
      createdAt: new Date(row.created_at)
    };
  }

  close(): void {
    this.db.close();
  }
}

export default NewsDatabase;
