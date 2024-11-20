const express = require("express");
const {
  getAllDevices,
  getDeviceById,
  addNewDevice,
  deleteDevice,
  deviceManage,
} = require("../controller/DeviceController");
const {
  addNewSetting,
  updateSetting,
} = require("../controller/SettingController");
const { getHistory } = require("../controller/HistoryController");

const router = express.Router();

router.get("/", getAllDevices);
router.get("/:id", getDeviceById);
router.post("/history", getHistory);
router.post("/add", addNewDevice);
router.delete("/delete/:name", deleteDevice);
router.post("/:device_name", deviceManage);
router.post("/setting", addNewSetting);
router.put("/setting", updateSetting);

module.exports = router;
