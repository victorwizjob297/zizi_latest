import express from "express";
import CategoryAttribute from "../models/CategoryAttribute.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.get("/category/:categoryId", async (req, res) => {
  try {
    const attributes = await CategoryAttribute.getByCategory(
      req.params.categoryId
    );

    res.json({
      success: true,
      data: attributes,
    });
  } catch (error) {
    console.error("Get category attributes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/category/:categoryId/searchable", async (req, res) => {
  try {
    console.log(req.params.categoryId, "req.params.categoryId");
    const attributes = await CategoryAttribute.getSearchableByCategory(
      req.params.categoryId
    );

    res.json({
      success: true,
      data: attributes,
    });
  } catch (error) {
    console.error("Get searchable attributes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const attribute = await CategoryAttribute.findById(req.params.id);

    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: "Attribute not found",
      });
    }

    res.json({
      success: true,
      data: attribute,
    });
  } catch (error) {
    console.error("Get attribute error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.post("/", protect, admin, async (req, res) => {
  try {
    const attribute = await CategoryAttribute.create(req.body);

    res.status(201).json({
      success: true,
      data: attribute,
      message: "Attribute created successfully",
    });
  } catch (error) {
    console.error("Create attribute error:", error);

    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "An attribute with this name already exists for this category",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.post("/bulk", protect, admin, async (req, res) => {
  try {
    const { category_id, attributes } = req.body;

    if (!category_id || !attributes || !Array.isArray(attributes)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
      });
    }

    const results = await CategoryAttribute.bulkCreate(category_id, attributes);

    res.status(201).json({
      success: true,
      data: results,
      message: "Attributes created successfully",
    });
  } catch (error) {
    console.error("Bulk create attributes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.put("/:id", protect, admin, async (req, res) => {
  try {
    const attribute = await CategoryAttribute.update(req.params.id, req.body);

    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: "Attribute not found",
      });
    }

    res.json({
      success: true,
      data: attribute,
      message: "Attribute updated successfully",
    });
  } catch (error) {
    console.error("Update attribute error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.put("/order/update", protect, admin, async (req, res) => {
  try {
    const { attributeIds } = req.body;

    if (!attributeIds || !Array.isArray(attributeIds)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data",
      });
    }

    await CategoryAttribute.updateOrder(attributeIds);

    res.json({
      success: true,
      message: "Attribute order updated successfully",
    });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const attribute = await CategoryAttribute.delete(req.params.id);

    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: "Attribute not found",
      });
    }

    res.json({
      success: true,
      message: "Attribute deleted successfully",
    });
  } catch (error) {
    console.error("Delete attribute error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
