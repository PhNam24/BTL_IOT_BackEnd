const { default: mqtt } = require("mqtt");
const db = require("../config/db/mysql");

class DeviceController {
  async getAllDevices(req, res) {
    try {
      const query = "SELECT * FROM Device";
      db.query(query, [], (err, results) => {
        if (err) {
          return res
            .status(400)
            .send("Error getting all devices: " + err.message);
        }
        res.status(200).json({ results });
      });
    } catch (error) {
      return res
        .status(400)
        .send("Error getting all devices: " + error.message);
    }
  }

  async getDeviceById(req, res) {
    try {
      const query = "SELECT * FROM Device WHERE id = ?";
      db.query(query, [req.params.id], (err, results) => {
        if (err) {
          return res
            .status(400)
            .send("Error getting device by id: " + err.message);
        }
        console.log(results);
        res.status(200).json({ results });
      });
    } catch (error) {
      res.status(400).send("Error getting device by id: " + error.message);
    }
  }

  getDevices() {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM Device";

      db.query(query, [], (err, results) => {
        if (err) {
          console.log("err:" + err.message);
          return reject("Error getting devices: " + err.message);
        }
        resolve(results); // Trả về mảng các thiết bị
      });
    });
  }

  getDevicesByUserId(user_id) {
    return new Promise((resolve, reject) => {
      const query =
        "SELECT id, name, fan_status, led_status, led_brightness FROM Device WHERE user_id = ?";

      db.query(query, [user_id], (err, results) => {
        if (err) {
          console.log("err:" + err.message);
          return reject("Error getting devices: " + err.message);
        }
        resolve(results); // Trả về mảng các thiết bị
      });
    });
  }

  async addNewDevice(req, res) {
    const { user_id, device_id, name } = req.body;
    try {
      const query = "INSERT INTO Device (user_id, id, name) VALUES (?, ?, ?)";
      db.query(query, [user_id, device_id, name], (err, result) => {
        if (err) {
          return res
            .status(400)
            .send("Error adding new device: " + err.message);
        }
        res.status(201).json({
          message: "Device added successfully",
          id: result.insertId,
          user_id: user_id,
          device_id: device_id,
          name: name,
        });
      });
    } catch (err) {
      return res.status(400).send("Error adding new device: " + err.message);
    }
  }

  async deleteDevice(req, res) {
    const { user_id, device_id } = req.body;
    try {
      const query =
        "UPDATE Device SET user_id = -1 WHERE user_id = ? AND id = ?";
      db.query(query, [user_id, device_id], (err, result) => {
        if (err) {
          return res.status(400).send("Error delete device: " + err.message);
        }
        res.status(201).json({
          message: "Device delete successfully",
          id: result.insertId,
          user_id: user_id,
          device_id: device_id,
        });
      });
    } catch (err) {
      return res.status(400).send("Error delete new device: " + err.message);
    }
  }

  async deviceManage(req, res) {
    const name = req.params.device_name;
    const { user_id, device_id, status, brightness } = req.body;
    try {
      brightness = brightness === null ? 7 : brightness;
      const query = `UPDATE Device SET ${name}_status = ?, led_brightness = ? WHERE user_id = ? AND id = ?`;
      db.query(
        query,
        [status, brightness, user_id, device_id],
        (err, result) => {
          if (err) {
            return res.status(400).send("Error manage device: " + err.message);
          }
          req.mqttPublish(
            "state",
            JSON.stringify({
              deviceId: device_id,
              led_state: status,
              brightness: brightness,
            })
          );
          res.status(201).json({
            message: "Device manage successfully",
            id: result.insertId,
            user_id: user_id,
            device_id: device_id,
            status: status,
            led_brightness: brightness,
          });
        }
      );
    } catch (err) {
      return res.status(400).send("Error manage device: " + err.message);
    }
  }
}

module.exports = new DeviceController();
