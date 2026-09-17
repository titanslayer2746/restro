// One-off backfill: link orders created before the Customer collection existed.
//
//   npm run backfill:customers            -> shows what would change, writes nothing
//   npm run backfill:customers -- --apply -> writes the changes
//
// Orders are matched to customers by phone number. Customer totals (orderCount,
// totalSpent, lastOrderAt) are then recomputed from all their linked orders, so
// running this more than once is safe.

const mongoose = require("mongoose");
const config = require("../config/config");
const Order = require("../models/orderModel");
const Customer = require("../models/customerModel");

const apply = process.argv.includes("--apply");

const run = async () => {
  if (!config.databaseURI) {
    throw new Error("MONGODB_URI is not set in server/.env");
  }
  await mongoose.connect(config.databaseURI);
  console.log(`Connected to ${mongoose.connection.host} (${apply ? "APPLY" : "dry run"})\n`);

  const unlinked = await Order.find({ customer: { $exists: false } })
    .sort({ createdAt: 1 })
    .select("customerDetails createdAt")
    .lean();

  // Group by phone; the most recent order decides the customer's name
  const byPhone = new Map();
  let skipped = 0;
  for (const order of unlinked) {
    const phone = String(order.customerDetails?.phone ?? "").trim();
    if (!phone) {
      skipped++;
      continue;
    }
    const group = byPhone.get(phone) || { name: "", orderIds: [] };
    group.name = order.customerDetails.name?.trim() || group.name;
    group.orderIds.push(order._id);
    byPhone.set(phone, group);
  }

  console.log(`Orders without a customer: ${unlinked.length}`);
  console.log(`Distinct phone numbers:    ${byPhone.size}`);
  if (skipped) console.log(`Skipped (no phone):        ${skipped}`);

  if (!apply) {
    for (const [phone, { name, orderIds }] of byPhone) {
      console.log(`  ${phone}  ${name || "(no name)"}  -> ${orderIds.length} order(s)`);
    }
    console.log("\nNothing written. Re-run with --apply to link these orders.");
    return;
  }

  const touched = [];
  for (const [phone, { name, orderIds }] of byPhone) {
    const customer = await Customer.findOneAndUpdate(
      { phone },
      { $setOnInsert: { name: name || "Guest" } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await Order.updateMany({ _id: { $in: orderIds } }, { $set: { customer: customer._id } });
    touched.push(customer._id);
  }

  // Recompute totals from every order now linked to these customers
  const totals = await Order.aggregate([
    { $match: { customer: { $in: touched } } },
    {
      $group: {
        _id: "$customer",
        orderCount: { $sum: 1 },
        totalSpent: { $sum: { $ifNull: ["$bills.totalWithTax", 0] } },
        lastOrderAt: { $max: "$orderDate" },
      },
    },
  ]);
  for (const { _id, ...fields } of totals) {
    await Customer.updateOne({ _id }, { $set: fields });
  }

  console.log(`\nLinked ${unlinked.length - skipped} order(s) to ${touched.length} customer(s).`);
};

run()
  .catch((error) => {
    console.error("Backfill failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
