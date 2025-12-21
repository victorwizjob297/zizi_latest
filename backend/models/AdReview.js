import { query, transaction } from "../config/database.js";

export class AdReview {
  static async create(reviewData) {
    const { ad_id, user_id, rating, comment } = reviewData;

    const result = await query(
      `INSERT INTO ad_reviews (ad_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [ad_id, user_id, rating, comment]
    );

    return result.rows[0];
  }

  static async getByAd(adId, page = 1, limit = 10, userId = null) {
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT ar.*,
        u.name as user_name,
        u.avatar_url as user_avatar,
        (SELECT COUNT(*) FROM ad_review_reactions WHERE review_id = ar.id AND reaction_type = 'like') as likes_count,
        (SELECT COUNT(*) FROM ad_review_reactions WHERE review_id = ar.id AND reaction_type = 'dislike') as dislikes_count
        ${
          userId
            ? `, (SELECT reaction_type FROM ad_review_reactions WHERE review_id = ar.id AND user_id = $4) as user_reaction`
            : ""
        }
       FROM ad_reviews ar
       JOIN users u ON ar.user_id = u.id
       WHERE ar.ad_id = $1
       ORDER BY ar.created_at DESC
       LIMIT $2 OFFSET $3`,
      userId ? [adId, limit, offset, userId] : [adId, limit, offset]
    );

    const countResult = await query(
      "SELECT COUNT(*) FROM ad_reviews WHERE ad_id = $1",
      [adId]
    );

    return {
      reviews: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    };
  }

  static async findById(id) {
    const result = await query(
      `SELECT ar.*,
        u.name as user_name,
        u.avatar_url as user_avatar,
        (SELECT COUNT(*) FROM ad_review_reactions WHERE review_id = ar.id AND reaction_type = 'like') as likes_count,
        (SELECT COUNT(*) FROM ad_review_reactions WHERE review_id = ar.id AND reaction_type = 'dislike') as dislikes_count
       FROM ad_reviews ar
       JOIN users u ON ar.user_id = u.id
       WHERE ar.id = $1`,
      [id]
    );

    return result.rows[0];
  }

  static async update(id, userId, updateData) {
    const { rating, comment } = updateData;
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (rating !== undefined) {
      fields.push(`rating = $${paramCount}`);
      values.push(rating);
      paramCount++;
    }

    if (comment !== undefined) {
      fields.push(`comment = $${paramCount}`);
      values.push(comment);
      paramCount++;
    }

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(id, userId);
    const result = await query(
      `UPDATE ad_reviews
       SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await query(
      "DELETE FROM ad_reviews WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, userId]
    );

    return result.rows[0];
  }

  static async addReaction(reviewId, userId, reactionType) {
    const result = await query(
      `INSERT INTO ad_review_reactions (review_id, user_id, reaction_type)
       VALUES ($1, $2, $3)
       ON CONFLICT (review_id, user_id)
       DO UPDATE SET reaction_type = EXCLUDED.reaction_type
       RETURNING *`,
      [reviewId, userId, reactionType]
    );

    return result.rows[0];
  }

  static async removeReaction(reviewId, userId) {
    const result = await query(
      "DELETE FROM ad_review_reactions WHERE review_id = $1 AND user_id = $2 RETURNING *",
      [reviewId, userId]
    );

    return result.rows[0];
  }

  static async getAdRating(adId) {
    const result = await query(
      `SELECT
        COUNT(*) as review_count,
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(*) FILTER (WHERE rating = 5) as five_star,
        COUNT(*) FILTER (WHERE rating = 4) as four_star,
        COUNT(*) FILTER (WHERE rating = 3) as three_star,
        COUNT(*) FILTER (WHERE rating = 2) as two_star,
        COUNT(*) FILTER (WHERE rating = 1) as one_star
       FROM ad_reviews
       WHERE ad_id = $1`,
      [adId]
    );

    return result.rows[0];
  }

  static async getUserReview(adId, userId) {
    const result = await query(
      "SELECT * FROM ad_reviews WHERE ad_id = $1 AND user_id = $2",
      [adId, userId]
    );

    return result.rows[0];
  }

  static async getReviewsByUser(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT ar.*,
        a.title as ad_title,
        a.images as ad_images,
        (SELECT COUNT(*) FROM ad_review_reactions WHERE review_id = ar.id AND reaction_type = 'like') as likes_count,
        (SELECT COUNT(*) FROM ad_review_reactions WHERE review_id = ar.id AND reaction_type = 'dislike') as dislikes_count
       FROM ad_reviews ar
       JOIN ads a ON ar.ad_id = a.id
       WHERE ar.user_id = $1
       ORDER BY ar.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await query(
      "SELECT COUNT(*) FROM ad_reviews WHERE user_id = $1",
      [userId]
    );

    return {
      reviews: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    };
  }
  static async getReceivedReviews(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT ar.*,
        u.name as reviewer_name,
        u.avatar_url as reviewer_avatar,
        a.title as ad_title,
        a.images as ad_images,
        (SELECT COUNT(*) FROM ad_review_reactions WHERE review_id = ar.id AND reaction_type = 'like') as likes_count,
        (SELECT COUNT(*) FROM ad_review_reactions WHERE review_id = ar.id AND reaction_type = 'dislike') as dislikes_count
       FROM ad_reviews ar
       JOIN users u ON ar.user_id = u.id
       JOIN ads a ON ar.ad_id = a.id
       WHERE a.user_id = $1  -- Get reviews for ads owned by this user
       ORDER BY ar.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) 
       FROM ad_reviews ar
       JOIN ads a ON ar.ad_id = a.id
       WHERE a.user_id = $1`,
      [userId]
    );

    return {
      reviews: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    };
  }

  // Get reviews by a user (given - reviews they've written)
  static async getGivenReviews(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT ar.*,
        a.title as ad_title,
        a.images as ad_images,
        a.user_id as ad_owner_id,
        owner.name as ad_owner_name,
        owner.avatar_url as ad_owner_avatar,
        (SELECT COUNT(*) FROM ad_review_reactions WHERE review_id = ar.id AND reaction_type = 'like') as likes_count,
        (SELECT COUNT(*) FROM ad_review_reactions WHERE review_id = ar.id AND reaction_type = 'dislike') as dislikes_count
       FROM ad_reviews ar
       JOIN ads a ON ar.ad_id = a.id
       JOIN users owner ON a.user_id = owner.id
       WHERE ar.user_id = $1
       ORDER BY ar.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await query(
      "SELECT COUNT(*) FROM ad_reviews WHERE user_id = $1",
      [userId]
    );

    return {
      reviews: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    };
  }

  // Get user's ad review statistics (as ad owner)
  static async getUserStats(userId) {
    const result = await query(
      `SELECT 
        COUNT(*) as total_reviews,
        COALESCE(AVG(ar.rating), 0) as average_rating,
        COUNT(*) FILTER (WHERE ar.rating = 5) as five_star,
        COUNT(*) FILTER (WHERE ar.rating = 4) as four_star,
        COUNT(*) FILTER (WHERE ar.rating = 3) as three_star,
        COUNT(*) FILTER (WHERE ar.rating = 2) as two_star,
        COUNT(*) FILTER (WHERE ar.rating = 1) as one_star
       FROM ad_reviews ar
       JOIN ads a ON ar.ad_id = a.id
       WHERE a.user_id = $1`,
      [userId]
    );

    return result.rows[0];
  }
}

export default AdReview;
