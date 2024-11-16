const express = require('express');
const { getAllLeds, turnOnLed, turnOffLed } = require('../controller/LedController');

const router = express.Router();

router.get('/', getAllLeds);
router.put('/on/:id', turnOnLed);
router.put('/off/:id', turnOffLed);

module.exports = router;