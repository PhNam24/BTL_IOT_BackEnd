const express = require('express');
const { getAllFans, turnOnFan, turnOffFan } = require('../controller/FanController');

const router = express.Router();

router.get('/', getAllFans);
router.put('/on/:id', turnOnFan);
router.put('/off/:id', turnOffFan);

module.exports = router;