const createHttpError = require('http-errors');
const Order = require('../models/orderModel');
const Table = require('../models/tableModel');
const Customer = require('../models/customerModel');
const mongoose = require('mongoose');

const PAYMENT_METHODS = ['Cash', 'Online'];
const PAYMENT_STATUSES = ['Pending', 'Verified'];

const addOrder = async (req, res, next) => {
    try {
        const { customerDetails, table, bills } = req.body;
        const name = customerDetails?.name?.trim();
        const phone = String(customerDetails?.phone ?? '').trim();

        if (!name || !phone) {
            return next(createHttpError(400, 'Customer name and phone are required'));
        }
        if (!mongoose.Types.ObjectId.isValid(table)) {
            return next(createHttpError(400, 'A valid table is required'));
        }
        if (!PAYMENT_METHODS.includes(req.body.paymentMethod)) {
            return next(createHttpError(400, 'Payment method must be Cash or Online'));
        }

        const tableDoc = await Table.findById(table);
        if (!tableDoc) {
            return next(createHttpError(404, 'Table not found'));
        }

        // A booked table can take more orders, but only from the guest already sitting there
        if (tableDoc.status === 'Booked' && tableDoc.currentOrder) {
            const current = await Order.findById(tableDoc.currentOrder).select('customerDetails.phone');
            if (current && current.customerDetails.phone !== phone) {
                return next(createHttpError(409, `Table ${tableDoc.tableNo} is occupied by another guest`));
            }
        }

        // Find the guest by phone (or create them), so repeat orders stay linked to one customer
        const customer = await Customer.findOneAndUpdate(
            { phone },
            { $set: { name } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Every payment starts unverified; only a cashier can mark it verified afterwards
        const { paymentStatus, verifiedBy, verifiedAt, ...orderData } = req.body;
        const order = new Order({
            ...orderData,
            customerDetails: { ...customerDetails, name, phone },
            customer: customer._id,
            paymentStatus: 'Pending',
        });
        await order.save();

        await Promise.all([
            Customer.updateOne(
                { _id: customer._id },
                { $inc: { orderCount: 1, totalSpent: bills?.totalWithTax || 0 }, $set: { lastOrderAt: order.orderDate } }
            ),
            Table.updateOne({ _id: table }, { status: 'Booked', currentOrder: order._id }),
        ]);

        await order.populate('table');

        res.status(201).json({
            status: 'success',
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
}

const getOrderById = async (req, res, next) => {
    try {

        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)) {
            const error = createHttpError(404, 'Invalid order ID');
            return next(error);
        }

        const order = await Order.findById(id);
        if (!order) {
            const error = createHttpError(404, 'Order not found');
            return next(error);
        }

        res.status(200).json({success: true, message: 'Order retrieved successfully', data: order}); 

    } catch (error) {
        next(error);
    } 
}

const getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .populate("table")
            .populate("verifiedBy", "name role");
        res.status(200).json({status: 'success', message: 'Orders retrieved successfully', data: orders});

    } catch (error) {
        next(error);
    }
}

const updateOrder = async (req, res, next) => {
    try {
        const { orderStatus } = req.body;
        const { id } = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)) {
            const error = createHttpError(404, 'Invalid ID');
            return next(error);
        }

        const order = await Order.findByIdAndUpdate(id, { orderStatus }, { new: true });

        if (!order) {
            const error = createHttpError(404, 'Order not found');
            return next(error);
        }

        res.status(200).json({success: true, message: 'Order updated successfully', data: order});
        
    } catch (error) {
        next(error);        
    }
}

// Cashier/admin confirms (or un-confirms) that the money for an order was received
const updatePayment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(createHttpError(404, 'Invalid ID'));
        }
        if (!PAYMENT_STATUSES.includes(paymentStatus)) {
            return next(createHttpError(400, 'Payment status must be Pending or Verified'));
        }

        const update = paymentStatus === 'Verified'
            ? { $set: { paymentStatus, verifiedBy: req.user._id, verifiedAt: new Date() } }
            : { $set: { paymentStatus }, $unset: { verifiedBy: 1, verifiedAt: 1 } };

        const order = await Order.findByIdAndUpdate(id, update, { new: true })
            .populate('table')
            .populate('verifiedBy', 'name role');

        if (!order) {
            return next(createHttpError(404, 'Order not found'));
        }

        const message = paymentStatus === 'Verified'
            ? `Payment of ₹${order.bills.totalWithTax.toFixed(2)} verified`
            : 'Payment marked as pending again';

        res.status(200).json({ success: true, message, data: order });
    } catch (error) {
        next(error);
    }
}

module.exports = { addOrder, getOrderById, getOrders, updateOrder, updatePayment };