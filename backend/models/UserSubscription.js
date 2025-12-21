import { query, transaction } from '../config/database.js';
import User from './User.js';

export class UserSubscription {
  // Create user subscription
  static async create(subscriptionData) {
    const { user_id, plan_id, payment_reference, start_date, end_date } = subscriptionData;
    
    return await transaction(async (client) => {
      // Deactivate any existing active subscription
      await client.query(
        'UPDATE user_subscriptions SET status = $1 WHERE user_id = $2 AND status = $3',
        ['cancelled', user_id, 'active']
      );

      // Create new subscription
      const result = await client.query(
        `INSERT INTO user_subscriptions (user_id, plan_id, payment_reference, start_date, end_date, status)
         VALUES ($1, $2, $3, $4, $5, 'active')
         RETURNING *`,
        [user_id, plan_id, payment_reference, start_date, end_date]
      );

      return result.rows[0];
    });
  }

  // Get user's current subscription
  static async getCurrentSubscription(userId) {
    const result = await query(
      `SELECT us.*, sp.name as plan_name, sp.features, sp.ad_limit
       FROM user_subscriptions us
       JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE us.user_id = $1 AND us.status = 'active' AND us.end_date > NOW()
       ORDER BY us.created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) return null;

    const subscription = result.rows[0];
    return {
      ...subscription,
      features: JSON.parse(subscription.features || '[]')
    };
  }

  // Get user's subscription history
  static async getUserSubscriptions(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT us.*, sp.name as plan_name, sp.price
       FROM user_subscriptions us
       JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE us.user_id = $1
       ORDER BY us.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) FROM user_subscriptions WHERE user_id = $1',
      [userId]
    );

    return {
      subscriptions: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    };
  }

  // Cancel subscription
  static async cancel(userId, subscriptionId) {
    const result = await query(
      `UPDATE user_subscriptions 
       SET status = 'cancelled', cancelled_at = NOW()
       WHERE id = $1 AND user_id = $2 AND status = 'active'
       RETURNING *`,
      [subscriptionId, userId]
    );

    return result.rows[0];
  }

  // Check if user can post ads
  static async canPostAd(userId) {
    const subscription = await this.getCurrentSubscription(userId);

    if (!subscription) {
      // Free plan - check ad count
      const adCountResult = await query(
        'SELECT COUNT(*) FROM ads WHERE user_id = $1 AND status IN ($2, $3)',
        [userId, 'active', 'pending']
      );

      const adCount = parseInt(adCountResult.rows[0].count);
      return { canPost: adCount < 5, remaining: Math.max(0, 5 - adCount), plan: 'free' };
    }

    // Paid plan - check ad limit
    const adCountResult = await query(
      'SELECT COUNT(*) FROM ads WHERE user_id = $1 AND status IN ($2, $3)',
      [userId, 'active', 'pending']
    );

    const adCount = parseInt(adCountResult.rows[0].count);
    const remaining = subscription.ad_limit === -1 ? -1 : Math.max(0, subscription.ad_limit - adCount);

    return {
      canPost: subscription.ad_limit === -1 || adCount < subscription.ad_limit,
      remaining,
      plan: subscription.plan_name
    };
  }

  // Check if user can post in a specific category
  static async canPostInCategory(userId, categoryId) {
    const categoryResult = await query(
      'SELECT allows_free_ads FROM categories WHERE id = $1',
      [categoryId]
    );

    if (!categoryResult.rows[0]) {
      throw new Error('Category not found');
    }

    const { allows_free_ads } = categoryResult.rows[0];

    const subscription = await this.getCurrentSubscription(userId);
    const inTrial = await User.isInTrialPeriod(userId);

    if (allows_free_ads) {
      return {
        canPost: true,
        requiresSubscription: false,
        inTrial,
        hasSubscription: !!subscription,
        message: 'Free posting allowed in this category'
      };
    }

    if (subscription) {
      return {
        canPost: true,
        requiresSubscription: false,
        inTrial: false,
        hasSubscription: true,
        subscriptionName: subscription.plan_name,
        message: 'You have an active subscription'
      };
    }

    if (inTrial) {
      return {
        canPost: true,
        requiresSubscription: false,
        inTrial: true,
        hasSubscription: false,
        message: 'Posting allowed during trial period'
      };
    }

    return {
      canPost: false,
      requiresSubscription: true,
      inTrial: false,
      hasSubscription: false,
      message: 'This category requires a subscription. Free trial has expired.'
    };
  }
}

export default UserSubscription;