import { query, transaction } from '../config/database.js';

export class AdAttribute {
  static async create(adId, attributeId, value) {
    const result = await query(
      `INSERT INTO ad_attributes (ad_id, attribute_id, value)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [adId, attributeId, JSON.stringify(value)]
    );

    return result.rows[0];
  }

  static async bulkCreate(adId, attributes) {
    if (!attributes || attributes.length === 0) {
      return [];
    }

    return await transaction(async (client) => {
      const results = [];

      for (const attr of attributes) {
        const result = await client.query(
          `INSERT INTO ad_attributes (ad_id, attribute_id, value)
           VALUES ($1, $2, $3)
           ON CONFLICT (ad_id, attribute_id)
           DO UPDATE SET value = EXCLUDED.value
           RETURNING *`,
          [adId, attr.attribute_id, JSON.stringify(attr.value)]
        );
        results.push(result.rows[0]);
      }

      return results;
    });
  }

  static async getByAd(adId) {
    const result = await query(
      `SELECT aa.*, ca.field_name, ca.field_label, ca.field_type
       FROM ad_attributes aa
       JOIN category_attributes ca ON aa.attribute_id = ca.id
       WHERE aa.ad_id = $1
       ORDER BY ca.order_index ASC`,
      [adId]
    );

    return result.rows;
  }

  static async update(adId, attributeId, value) {
    const result = await query(
      `UPDATE ad_attributes
       SET value = $1
       WHERE ad_id = $2 AND attribute_id = $3
       RETURNING *`,
      [JSON.stringify(value), adId, attributeId]
    );

    return result.rows[0];
  }

  static async delete(adId, attributeId) {
    const result = await query(
      'DELETE FROM ad_attributes WHERE ad_id = $1 AND attribute_id = $2 RETURNING *',
      [adId, attributeId]
    );

    return result.rows[0];
  }

  static async deleteByAd(adId) {
    const result = await query(
      'DELETE FROM ad_attributes WHERE ad_id = $1',
      [adId]
    );

    return result.rowCount;
  }

  static async searchByAttributes(categoryId, filters) {
    const conditions = [];
    const params = [categoryId];
    let paramCount = 2;

    Object.entries(filters).forEach(([fieldName, value]) => {
      conditions.push(`
        EXISTS (
          SELECT 1 FROM ad_attributes aa
          JOIN category_attributes ca ON aa.attribute_id = ca.id
          WHERE aa.ad_id = ads.id
          AND ca.field_name = $${paramCount}
          AND aa.value::text ILIKE $${paramCount + 1}
        )
      `);
      params.push(fieldName, `%${value}%`);
      paramCount += 2;
    });

    const whereClause = conditions.length > 0
      ? `AND ${conditions.join(' AND ')}`
      : '';

    const result = await query(
      `SELECT DISTINCT ads.*
       FROM ads
       WHERE ads.category_id = $1
       ${whereClause}
       ORDER BY ads.created_at DESC`,
      params
    );

    return result.rows;
  }
}

export default AdAttribute;
