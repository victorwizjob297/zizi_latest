import express from "express";
import Follow from "../models/Follow.js";
import { protect } from "../middleware/auth.js";
import { validateId } from "../middleware/validation.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Follow a user
// @route   POST /api/follows/:id
// @access  Private
router.post("/:id", validateId, async (req, res) => {
  try {
    const followingId = parseInt(req.params.id);

    const follow = await Follow.create(req.user.id, followingId);

    if (!follow) {
      return res.status(400).json({
        success: false,
        message: "Already following this user",
      });
    }

    res.status(201).json({
      success: true,
      data: follow,
      message: "User followed successfully",
    });
  } catch (error) {
    console.error("Follow user error:", error);

    if (error.message.includes("Cannot follow yourself")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Unfollow a user
// @route   DELETE /api/follows/:id
// @access  Private
router.delete("/:id", validateId, async (req, res) => {
  try {
    const followingId = parseInt(req.params.id);

    const follow = await Follow.delete(req.user.id, followingId);

    if (!follow) {
      return res.status(404).json({
        success: false,
        message: "Not following this user",
      });
    }

    res.json({
      success: true,
      message: "User unfollowed successfully",
    });
  } catch (error) {
    console.error("Unfollow user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Get user's followers
// @route   GET /api/follows/:id/followers
// @access  Public
router.get("/:id/followers", validateId, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await Follow.getFollowers(
      req.params.id,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Get users that user is following
// @route   GET /api/follows/:id/following
// @access  Public
router.get("/:id/following", validateId, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await Follow.getFollowing(
      req.params.id,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Check if following a user
// @route   GET /api/follows/:id/status
// @access  Private
router.get("/:id/status", validateId, async (req, res) => {
  try {
    const isFollowing = await Follow.isFollowing(
      req.user.id,
      parseInt(req.params.id)
    );
    const counts = await Follow.getCounts(parseInt(req.params.id));

    res.json({
      success: true,
      data: {
        is_following: isFollowing,
        ...counts,
      },
    });
  } catch (error) {
    console.error("Get follow status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
