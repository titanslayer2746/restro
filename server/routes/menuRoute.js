const express = require('express');
const router = express.Router();
const { getMenu, addCategory, addDish } = require('../controllers/menuController');
const { isVerifiedUser, isAdmin } = require('../middlewares/tokenVerification');

router.route('/').get(isVerifiedUser, getMenu);
router.route('/category').post(isVerifiedUser, isAdmin, addCategory);
router.route('/dish').post(isVerifiedUser, isAdmin, addDish);

module.exports = router;
