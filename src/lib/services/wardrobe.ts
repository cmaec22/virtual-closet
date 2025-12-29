import { getDatabase } from '../db/db';
import type { ClothingItem, ClothingItemInput } from '../types';

export class WardrobeService {
  /**
   * Create a new clothing item
   */
  static create(input: ClothingItemInput): ClothingItem {
    const db = getDatabase();

    const stmt = db.prepare(`
      INSERT INTO clothing_items (name, type, color, warmth_rating, formality_level, image_path, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
      input.name,
      input.type,
      input.color,
      input.warmth_rating,
      input.formality_level,
      input.image_path || null,
      JSON.stringify(input.tags || [])
    );

    return this.getById(Number(info.lastInsertRowid))!;
  }

  /**
   * Get all clothing items with optional filters
   */
  static getAll(filters?: {
    type?: string;
    formality_level?: string;
    warmth_rating?: number;
    color?: string;
    tag?: string;
    limit?: number;
    offset?: number;
  }): ClothingItem[] {
    const db = getDatabase();

    let query = 'SELECT * FROM clothing_items WHERE 1=1';
    const params: any[] = [];

    if (filters?.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters?.formality_level) {
      query += ' AND formality_level = ?';
      params.push(filters.formality_level);
    }

    if (filters?.warmth_rating) {
      query += ' AND warmth_rating = ?';
      params.push(filters.warmth_rating);
    }

    if (filters?.color) {
      query += ' AND color LIKE ?';
      params.push(`%${filters.color}%`);
    }

    if (filters?.tag) {
      query += ' AND tags LIKE ?';
      params.push(`%"${filters.tag}"%`);
    }

    query += ' ORDER BY created_at DESC';

    if (filters?.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters?.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    const stmt = db.prepare(query);
    const rows = stmt.all(...params) as any[];

    return rows.map(row => ({
      ...row,
      tags: JSON.parse(row.tags || '[]'),
    }));
  }

  /**
   * Get a single clothing item by ID
   */
  static getById(id: number): ClothingItem | null {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM clothing_items WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return {
      ...row,
      tags: JSON.parse(row.tags || '[]'),
    };
  }

  /**
   * Update a clothing item
   */
  static update(id: number, input: Partial<ClothingItemInput>): ClothingItem | null {
    const db = getDatabase();

    const updates: string[] = [];
    const params: any[] = [];

    if (input.name !== undefined) {
      updates.push('name = ?');
      params.push(input.name);
    }

    if (input.type !== undefined) {
      updates.push('type = ?');
      params.push(input.type);
    }

    if (input.color !== undefined) {
      updates.push('color = ?');
      params.push(input.color);
    }

    if (input.warmth_rating !== undefined) {
      updates.push('warmth_rating = ?');
      params.push(input.warmth_rating);
    }

    if (input.formality_level !== undefined) {
      updates.push('formality_level = ?');
      params.push(input.formality_level);
    }

    if (input.image_path !== undefined) {
      updates.push('image_path = ?');
      params.push(input.image_path);
    }

    if (input.tags !== undefined) {
      updates.push('tags = ?');
      params.push(JSON.stringify(input.tags));
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const query = `UPDATE clothing_items SET ${updates.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(query);
    stmt.run(...params);

    return this.getById(id);
  }

  /**
   * Delete a clothing item
   */
  static delete(id: number): boolean {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM clothing_items WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0;
  }

  /**
   * Get count of items (useful for pagination)
   */
  static count(filters?: {
    type?: string;
    formality_level?: string;
    warmth_rating?: number;
  }): number {
    const db = getDatabase();

    let query = 'SELECT COUNT(*) as count FROM clothing_items WHERE 1=1';
    const params: any[] = [];

    if (filters?.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters?.formality_level) {
      query += ' AND formality_level = ?';
      params.push(filters.formality_level);
    }

    if (filters?.warmth_rating) {
      query += ' AND warmth_rating = ?';
      params.push(filters.warmth_rating);
    }

    const stmt = db.prepare(query);
    const result = stmt.get(...params) as { count: number };
    return result.count;
  }
}
