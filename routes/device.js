const express = require('express');
const { getAllDevices, getDeviceById, getDevicesByUserId, addNewDevice, deleteDevice, deviceManage } = require('../controller/DeviceController');

const router = express.Router();

router.get('/', getAllDevices);
router.get('/:id', getDeviceById);
router.get('/:userid', getDevicesByUserId);
router.post('/add', addNewDevice);
router.delete('/delete/:name', deleteDevice);
router.post('/:device_name', deviceManage);

module.exports = router;