const express = require('express');
const { getAllDevices, getDeviceById, getDevicesByUserId} = require('../controller/DeviceController');

const router = express.Router();

router.get('/', getAllDevices);
router.get('/:id', getDeviceById);
router.get('/:userid', getDevicesByUserId);

module.exports = router;