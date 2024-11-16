const express = require('express');
const { getAllSensors, turnOnSensor, turnOffSensor, getNewestData, getHistoryData, testConnection } = require('../controller/SensorController')

const router = express.Router();

router.get('/', getAllSensors);
router.put('/on/:id', turnOnSensor);
router.put('/off/:id', turnOffSensor);
router.get('/newest/:id', getNewestData);
router.get('/history/:id', getHistoryData);
router.get('/test', testConnection);

module.exports = router;