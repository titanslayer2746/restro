const createHttpError = require("http-errors");
const mongoose = require("mongoose");
const Category = require("../models/categoryModel");
const Dish = require("../models/dishModel");

const MAX_NAME = 60;

// Every category with its dishes, in menu order
const getMenu = async (req, res, next) => {
  try {
    const [categories, dishes] = await Promise.all([
      Category.find().sort({ sortOrder: 1, createdAt: 1 }).lean(),
      Dish.find().sort({ createdAt: 1 }).lean(),
    ]);

    const menu = categories.map((category) => ({
      ...category,
      items: dishes.filter((dish) => String(dish.category) === String(category._id)),
    }));

    res.status(200).json({ success: true, message: "Menu fetched successfully", data: menu });
  } catch (error) {
    next(error);
  }
};

const addCategory = async (req, res, next) => {
  try {
    const name = String(req.body.name ?? "").trim();
    if (!name || name.length > MAX_NAME) {
      return next(createHttpError(400, `Category name is required (max ${MAX_NAME} characters)`));
    }

    if (await Category.exists({ key: name.toLowerCase() })) {
      return next(createHttpError(409, `"${name}" already exists`));
    }

    // New categories go to the end of the menu
    const last = await Category.findOne().sort({ sortOrder: -1 }).select("sortOrder").lean();
    const category = await Category.create({ name, sortOrder: (last?.sortOrder ?? -1) + 1 });

    res.status(201).json({ success: true, message: `Category "${name}" added`, data: category });
  } catch (error) {
    if (error.code === 11000) return next(createHttpError(409, "That category already exists"));
    next(error);
  }
};

const addDish = async (req, res, next) => {
  try {
    const name = String(req.body.name ?? "").trim();
    const price = Number(req.body.price);
    const tag = String(req.body.tag ?? "").trim();
    const { categoryId } = req.body;

    if (!name || name.length > MAX_NAME) {
      return next(createHttpError(400, `Dish name is required (max ${MAX_NAME} characters)`));
    }
    if (!Number.isFinite(price) || price <= 0) {
      return next(createHttpError(400, "Price must be more than 0"));
    }
    if (!mongoose.Types.ObjectId.isValid(categoryId) || !(await Category.exists({ _id: categoryId }))) {
      return next(createHttpError(400, "Pick a valid category"));
    }

    const dish = await Dish.create({
      name,
      price: Math.round(price * 100) / 100,
      category: categoryId,
      ...(tag && { tag }),
    });

    res.status(201).json({ success: true, message: `"${name}" added to the menu`, data: dish });
  } catch (error) {
    if (error.code === 11000) return next(createHttpError(409, "A dish with that name is already in this category"));
    next(error);
  }
};

module.exports = { getMenu, addCategory, addDish };
