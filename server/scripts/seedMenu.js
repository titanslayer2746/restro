// Loads the starter menu (seed/menuData.json) into the database.
//
//   npm run seed:menu
//
// Safe to run more than once: categories and dishes that already exist
// (matched by name) are left as they are, so prices edited later are kept.

const mongoose = require("mongoose");
const config = require("../config/config");
const Category = require("../models/categoryModel");
const Dish = require("../models/dishModel");
const menuData = require("../seed/menuData.json");

const run = async () => {
  if (!config.databaseURI) {
    throw new Error("MONGODB_URI is not set in server/.env");
  }
  await mongoose.connect(config.databaseURI);
  // Make sure the unique indexes exist before inserting
  await Promise.all([Category.syncIndexes(), Dish.syncIndexes()]);
  console.log(`Connected to ${mongoose.connection.host}\n`);

  let newCategories = 0;
  let newDishes = 0;

  for (const [index, entry] of menuData.entries()) {
    const key = entry.name.trim().toLowerCase();
    const before = await Category.exists({ key });
    const category = await Category.findOneAndUpdate(
      { key },
      { $setOnInsert: { name: entry.name, key, sortOrder: index } },
      { upsert: true, new: true }
    );
    if (!before) newCategories++;

    for (const item of entry.items) {
      const result = await Dish.updateOne(
        { category: category._id, name: item.name },
        {
          $setOnInsert: {
            name: item.name,
            price: item.price,
            category: category._id,
            ...(item.category && { tag: item.category }),
          },
        },
        { upsert: true, collation: { locale: "en", strength: 2 } }
      );
      if (result.upsertedCount) newDishes++;
    }

    console.log(`  ${entry.name.padEnd(18)} ${entry.items.length} dishes`);
  }

  console.log(`\nAdded ${newCategories} new categor${newCategories === 1 ? "y" : "ies"} and ${newDishes} new dish(es).`);
};

run()
  .catch((error) => {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
