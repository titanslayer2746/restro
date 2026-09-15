const express = require('express');
const router = express.Router();
const { addOrder, getOrders, getOrderById, updateOrder, updatePayment } = require('../controllers/orderController');
const { isVerifiedUser, hasRole } = require('../middlewares/tokenVerification');

router.route("/").post(isVerifiedUser, addOrder);
router.route("/").get(isVerifiedUser, getOrders);
router.route("/:id").get(isVerifiedUser, getOrderById);
router.route("/:id").put(isVerifiedUser, updateOrder);
router.route("/:id/payment").put(isVerifiedUser, hasRole("Cashier", "Admin"), updatePayment);

module.exports = router;
