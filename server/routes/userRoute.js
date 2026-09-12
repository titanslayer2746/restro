const express = require('express');
const { register, login, getUserData, logout, getStaff, updateRole } = require('../controllers/userController');
const { isVerifiedUser, isAdmin } = require('../middlewares/tokenVerification');
const router = express.Router();

// Authentication Routes
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/').get(isVerifiedUser, getUserData);
router.route("/logout").post(isVerifiedUser, logout);

// Staff management (admin only)
router.route('/staff').get(isVerifiedUser, isAdmin, getStaff);
router.route('/:id/role').put(isVerifiedUser, isAdmin, updateRole);

module.exports = router;
