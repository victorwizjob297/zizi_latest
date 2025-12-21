import express from "express";
import AdReview from "../models/AdReview.js";
import { protect, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/ad/:adId", optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await AdReview.getByAd(
      req.params.adId,
      parseInt(page),
      parseInt(limit),
      req.user?.id
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get ad reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/ad/:adId/rating", async (req, res) => {
  try {
    const rating = await AdReview.getAdRating(req.params.adId);

    res.json({
      success: true,
      data: rating,
    });
  } catch (error) {
    console.error("Get ad rating error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/ad/:adId/my-review", protect, async (req, res) => {
  try {
    const review = await AdReview.getUserReview(req.params.adId, req.user.id);

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Get user review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await AdReview.getReviewsByUser(
      req.params.userId,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get user reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const review = await AdReview.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Get review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.post("/ad/:adId", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment is required",
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const existingReview = await AdReview.getUserReview(
      req.params.adId,
      req.user.id
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this ad",
      });
    }

    const review = await AdReview.create({
      ad_id: req.params.adId,
      user_id: req.user.id,
      rating: rating || null,
      comment: comment.trim(),
    });

    const fullReview = await AdReview.findById(review.id);

    res.status(201).json({
      success: true,
      data: fullReview,
      message: "Review posted successfully",
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (comment !== undefined && comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment.trim();

    const review = await AdReview.update(
      req.params.id,
      req.user.id,
      updateData
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or unauthorized",
      });
    }

    const fullReview = await AdReview.findById(review.id);

    res.json({
      success: true,
      data: fullReview,
      message: "Review updated successfully",
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const review = await AdReview.delete(req.params.id, req.user.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or unauthorized",
      });
    }

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.post("/:id/react", protect, async (req, res) => {
  try {
    const { type } = req.body;

    if (!["like", "dislike"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reaction type. Must be "like" or "dislike"',
      });
    }

    await AdReview.addReaction(req.params.id, req.user.id, type);

    const review = await AdReview.findById(req.params.id);

    res.json({
      success: true,
      data: review,
      message: "Reaction added successfully",
    });
  } catch (error) {
    console.error("Add reaction error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.delete("/:id/react", protect, async (req, res) => {
  try {
    await AdReview.removeReaction(req.params.id, req.user.id);

    const review = await AdReview.findById(req.params.id);

    res.json({
      success: true,
      data: review,
      message: "Reaction removed successfully",
    });
  } catch (error) {
    console.error("Remove reaction error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/received/:userId", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await AdReview.getReceivedReviews(
      req.params.userId,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get received reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Get reviews given by a user
// @route   GET /api/ad-reviews/given/:userId
// @access  Public
router.get("/given/:userId", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await AdReview.getGivenReviews(
      req.params.userId,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get given reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Get user's ad review statistics
// @route   GET /api/ad-reviews/stats/:userId
// @access  Public
router.get("/stats/:userId", async (req, res) => {
  try {
    const stats = await AdReview.getUserStats(req.params.userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Get user's own received reviews (protected)
// @route   GET /api/ad-reviews/my/received
// @access  Private
router.get("/my/received", protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await AdReview.getReceivedReviews(
      req.user.id,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get my received reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Get user's own given reviews (protected)
// @route   GET /api/ad-reviews/my/given
// @access  Private
router.get("/my/given", protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await AdReview.getGivenReviews(
      req.user.id,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get my given reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Get user's own review statistics
// @route   GET /api/ad-reviews/my/stats
// @access  Private
router.get("/my/stats", protect, async (req, res) => {
  try {
    const stats = await AdReview.getUserStats(req.user.id);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get my stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
