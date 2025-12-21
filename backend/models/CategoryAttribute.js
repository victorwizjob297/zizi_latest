import { query } from "../config/database.js";

export class CategoryAttribute {
  static async create(attributeData) {
    const {
      category_id,
      field_name,
      field_label,
      field_type,
      field_options = [],
      placeholder,
      validation_rules = {},
      order_index = 0,
      conditional_display,
      is_searchable = false,
      is_required = false,
      help_text,
    } = attributeData;

    const result = await query(
      `INSERT INTO category_attributes (
        category_id, field_name, field_label, field_type, field_options,
        placeholder, validation_rules, order_index, conditional_display,
        is_searchable, is_required, help_text
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        category_id,
        field_name,
        field_label,
        field_type,
        JSON.stringify(field_options),
        placeholder,
        JSON.stringify(validation_rules),
        order_index,
        conditional_display ? JSON.stringify(conditional_display) : null,
        is_searchable,
        is_required,
        help_text,
      ]
    );

    return result.rows[0];
  }

  static async getByCategory(categoryId) {
    const result = await query(
      `SELECT * FROM category_attributes
       WHERE category_id = $1
       ORDER BY order_index ASC, id ASC`,
      [categoryId]
    );

    return result.rows;
  }

  static async findById(id) {
    const result = await query(
      "SELECT * FROM category_attributes WHERE id = $1",
      [id]
    );

    return result.rows[0];
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      "field_name",
      "field_label",
      "field_type",
      "field_options",
      "placeholder",
      "validation_rules",
      "order_index",
      "conditional_display",
      "is_searchable",
      "is_required",
      "help_text",
    ];

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        if (
          ["field_options", "validation_rules", "conditional_display"].includes(
            key
          )
        ) {
          fields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(updateData[key]));
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(updateData[key]);
        }
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(id);
    const result = await query(
      `UPDATE category_attributes SET ${fields.join(
        ", "
      )}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async delete(id) {
    const result = await query(
      "DELETE FROM category_attributes WHERE id = $1 RETURNING *",
      [id]
    );

    return result.rows[0];
  }

  static async bulkCreate(categoryId, attributes) {
    const results = [];

    for (const attr of attributes) {
      const result = await this.create({
        category_id: categoryId,
        ...attr,
      });
      results.push(result);
    }

    return results;
  }

  static async getSearchableByCategory(categoryId) {
    console.log("all", categoryId);
    const result = await query(
      `SELECT * FROM category_attributes
       WHERE category_id = $1 AND is_searchable = true
       ORDER BY order_index ASC, id ASC`,
      [categoryId]
    );

    return result.rows;
  }

  static async updateOrder(attributeIds) {
    const promises = attributeIds.map((id, index) => {
      return query(
        "UPDATE category_attributes SET order_index = $1 WHERE id = $2",
        [index, id]
      );
    });

    await Promise.all(promises);
    return true;
  }
}

export default CategoryAttribute;
