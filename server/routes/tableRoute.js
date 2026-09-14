const express = require('express');
const router = express.Router();
const { addTable, getTable, updateTable, clearTable } = require('../controllers/tableController');
const { isVerifiedUser, isAdmin } = require('../middlewares/tokenVerification');

router.route('/').post(isVerifiedUser, isAdmin, addTable);
router.route('/').get(isVerifiedUser, getTable);
router.route('/:id').put(isVerifiedUser, updateTable);
router.route('/:id/clear').put(isVerifiedUser, clearTable);

module.exports = router;
