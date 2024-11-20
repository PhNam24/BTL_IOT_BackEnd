const express = require("express");
const {
  getAllDevices,
  getDeviceById,
  getDevicesByUserId,
  addNewDevice,
  deleteDevice,
  deviceManage,
} = require("../controller/DeviceController");
const {
  addNewSetting,
  updateSetting,
} = require("../controller/SettingController");
const { getCurrentData } = require("../controller/HistoryController");

const router = express.Router();

router.get("/", getAllDevices);
router.get("/:id", getDeviceById);
router.get("/history", getCurrentData);
router.post("/add", addNewDevice);
router.delete("/delete/:name", deleteDevice);
router.post("/:device_name", deviceManage);
router.post("/setting", addNewSetting);
router.put("/setting", updateSetting);

module.exports = router;