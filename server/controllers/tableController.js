const createHttpError = require("http-errors");
const Table = require("../models/tableModel");
const Order = require("../models/orderModel");
const mongoose = require("mongoose");

const MAX_SEATS = 20;

const addTable = async (req, res, next) => {
  try {
    const seats = Number(req.body.seats);
    if (!Number.isInteger(seats) || seats < 1 || seats > MAX_SEATS) {
      const error = createHttpError(400, `Seats must be a whole number between 1 and ${MAX_SEATS}`);
      return next(error);
    }

    // The table number is assigned here: one more than the highest existing number.
    // If two tables are added at the same moment they collide on the unique index, so retry.
    for (let attempt = 0; attempt < 3; attempt++) {
      const last = await Table.findOne().sort({ tableNo: -1 }).select("tableNo").lean();
      const tableNo = (last?.tableNo || 0) + 1;

      try {
        const newTable = await Table.create({ tableNo, seats });
        return res.status(201).json({
          success: true,
          message: `Table ${tableNo} added`,
          table: newTable,
        });
      } catch (error) {
        if (error.code !== 11000) throw error;
      }
    }

    next(createHttpError(409, "Couldn't assign a table number, please try again"));
  } catch (error) {
    next(error);
  }
};

const getTable = async (req, res, next) => {
  try {
    const tables = await Table.find().sort({ tableNo: 1 }).populate({
      path: "currentOrder",
      select: "customerDetails",
    });
    res
      .status(200)
      .json({ success: true, message: "Tables fetched successfully", tables });
  } catch (error) {
    next(error);
  }
};

const updateTable = async (req, res, next) => {
  try {
    const { status, orderId } = req.body;
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(404, "Invalid table ID");
      return next(error);
    }

    const table = await Table.findByIdAndUpdate(
      id,
      { status, currentOrder: orderId },
      { new: true }
    );
    if (!table) {
      const error = createHttpError(404, "Table not found");
      return next(error);
    }

    res
      .status(200)
      .json({ success: true, message: "Table updated successfully", table });
  } catch (error) {
    next(error);
  }
};

// Free a table once its guest has left. Any of its orders still open are marked Completed.
const clearTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(404, "Invalid table ID"));
    }

    const table = await Table.findByIdAndUpdate(
      id,
      { status: "Available", currentOrder: null },
      { new: true }
    );
    if (!table) {
      return next(createHttpError(404, "Table not found"));
    }

    const { modifiedCount } = await Order.updateMany(
      { table: table._id, orderStatus: { $ne: "Completed" } },
      { orderStatus: "Completed" }
    );

    res.status(200).json({
      success: true,
      message: `Table ${table.tableNo} is free`,
      table,
      completedOrders: modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addTable, getTable, updateTable, clearTable };
