const express = require('express');
const router = express.Router();
const { getCustomers, getCustomerOrders } = require('../controllers/customerController');
const { isVerifiedUser } = require('../middlewares/tokenVerification');

router.route('/').get(isVerifiedUser, getCustomers);
router.route('/:id/orders').get(isVerifiedUser, getCustomerOrders);

module.exports = router;
