const db = require("../config/db/mysql");

class SettingController {
  getSettingByDeviceId(device_id) {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM Setting WHERE device_id = ?";
      db.query(query, [device_id], (err, results) => {
        if (err) {
          console.log("Error getting setting by device id: " + err.message);
          return reject("Error getting setting: " + err.message);
        }
        resolve(results[0]);
      });
    });
  }

  async addNewSetting(req, res) {
    const {
      user_id,
      device_id,
      lower_temp,
      upper_temp,
      lower_humid,
      upper_humid,
    } = req.body;
    try {
      const query =
        "INSERT INTO Setting (user_id, device_id, lower_temp, upper_temp, lower_humid, upper_humid) VALUES (?, ?, ?, ?, ?, ?)";
      db.query(
        query,
        [user_id, device_id, lower_temp, upper_temp, lower_humid, upper_humid],
        (err, result) => {
          if (err) {
            return res
              .status(400)
              .send("Error adding new setting: " + err.message);
          }
          res.status(201).json({
            message: "Setting added successfully",
            id: result.insertId,
            user_id: user_id,
            device_id: device_id,
            lower_temp: lower_temp,
            upper_temp: upper_temp,
            lower_humid: lower_humid,
            upper_humid: upper_humid,
          });
        }
      );
    } catch (err) {
      return res.status(400).send("Error adding new setting: " + err.message);
    }
  }

  async updateSetting(req, res) {
    const {
      user_id,
      device_id,
      lower_temp,
      upper_temp,
      lower_humid,
      upper_humid,
    } = req.body;
    try {
      // Build the SET clause dynamically
      let fields = [];
      let values = [];

      if (lower_temp !== -1) {
        fields.push("lower_temp = ?");
        values.push(lower_temp);
      }
      if (upper_temp !== -1) {
        fields.push("upper_temp = ?");
        values.push(upper_temp);
      }
      if (lower_humid !== -1) {
        fields.push("lower_humid = ?");
        values.push(lower_humid);
      }
      if (upper_humid !== -1) {
        fields.push("upper_humid = ?");
        values.push(upper_humid);
      }
      if (fields.length === 0) {
        return res.status(400).send("No valid fields to update.");
      }
      values.push(user_id, device_id);
      const query = `UPDATE Setting 
      SET ${fields.join(", ")} 
      WHERE device_id IN (SELECT id FROM Device WHERE user_id = ?) AND device_id = ?`;
      db.query(query, values, (err, result) => {
        if (err) {
          return res.status(400).send("Error updating setting: " + err.message);
        }
        const setting = {
          deviceId: device_id,
          lower_temp: lower_temp !== -1 ? lower_temp : undefined,
          upper_temp: upper_temp !== -1 ? upper_temp : undefined,
          lower_humid: lower_humid !== -1 ? lower_humid : undefined,
          upper_humid: upper_humid !== -1 ? upper_humid : undefined,
        };

        res.status(201).json({
          message: "Setting updated successfully",
          setting,
        });
      });
    } catch (err) {
      return res.status(400).send("Error updating setting: " + err.message);
    }
  }
}

module.exports = new SettingController();
