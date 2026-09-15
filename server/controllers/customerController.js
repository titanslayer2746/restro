const createHttpError = require("http-errors");
const mongoose = require("mongoose");
const Customer = require("../models/customerModel");
const Order = require("../models/orderModel");

const getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find().sort({ lastOrderAt: -1 });
    res.status(200).json({ success: true, message: "Customers fetched successfully", data: customers });
  } catch (error) {
    next(error);
  }
};

// One customer with every order they have placed, newest first
const getCustomerOrders = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(404, "Invalid customer ID"));
    }

    const customer = await Customer.findById(id);
    if (!customer) {
      return next(createHttpError(404, "Customer not found"));
    }

    const orders = await Order.find({ customer: id }).sort({ createdAt: -1 }).populate("table");
    res.status(200).json({ success: true, message: "Customer orders fetched successfully", data: { customer, orders } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCustomers, getCustomerOrders };
