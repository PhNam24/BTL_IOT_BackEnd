const { json } = require("express");
const db = require("../config/db/mysql");
const { getDevicesByUserId } = require("./DeviceController");
const { getSettingByDeviceId } = require("./SettingController");

class UserController {
  async login(req, res) {
    const { username, password } = req.body;
    try {
      const query = "SELECT * FROM User WHERE username = ? AND password = ?";
      db.query(query, [username, password], async (err, results) => {
        if (err) {
          return res.status(400).send("Error logging in: " + err.message);
        }
        if (results.length === 0) {
          return res.status(400).send("User not found");
        }
        const user = results[0];
        // let isMatch = await bcrypt.compare(password, user.password);
        // if (!isMatch) {
        //     return res.status(400).send('Invalid credentials');
        // }
        // const token = jwt.sign({ userId: user.id }, 'secretkey', { expiresIn: '1h' });
        let devices = await getDevicesByUserId(user.id);
        let deviceList = [];
        for (const element of devices) {
          try {
            let setting = await getSettingByDeviceId(element.id);
            console.log("setting:", setting);
            deviceList.push({
              id: element.id,
              name: element.name,
              fanStatus: element.fan_status,
              ledStatus: element.led_status,
              ledBrightness: element.led_brightness,
              waStatus: element.wa_status,
              lowerTemp: setting.lower_temp,
              upperTemp: setting.upper_temp,
              lowerHumid: setting.lower_humid,
              upperHumid: setting.upper_humid,
            });
          } catch (settingError) {
            console.error(
              `Error getting setting for device ${element.id}:`,
              settingError
            );
            // Bạn có thể xử lý lỗi cụ thể cho từng thiết bị ở đây nếu cần
          }
        }
        res.status(200).json({
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.uername,
          deviceList: deviceList,
        });
      });
    } catch (error) {
      res.status(400).send("Error logging in: " + error.message);
    }
  }

  async register(req, res) {
    const { email, name, username, password } = req.body;
    try {
      // const hashedPassword = await bcrypt.hash(password, 10);
      const query =
        "INSERT INTO User (email, name, username, password, role) VALUES (?, ?, ?, ?, ?)";
      db.query(
        query,
        [email, name, username, password, "user"],
        (err, result) => {
          if (err) {
            return res
              .status(400)
              .send("Error registering user: " + err.message);
          }
          res.status(201).json({
            message: "User registered successfully",
            id: result.insertId,
            email: email,
            name: name,
            username: username,
            attribute: "user",
          });
        }
      );
    } catch (error) {
      res.status(400).send("Error registering user: " + error.message);
    }
  }

  async updateUser(req, res) {
    const { email, name, password } = req.body;
    try {
      const query =
        "UPDATE User SET email = ?, name = ?, password = ? WHERE username = ?";
      db.query(
        query,
        [email, name, password, req.params.username],
        (err, result) => {
          if (err) {
            return res.status(400).send("Error updating user: " + err.message);
          }
          res.status(200).json({
            message: "User updated successfully",
            id: req.params.username,
            email: email,
            name: name,
          });
        }
      );
    } catch (error) {
      res.status(400).send("Error updating user: " + error.message);
    }
  }

  async deleteUser(req, res) {
    try {
      const query = "DELETE FROM User WHERE username = ?";
      db.query(query, [req.params.username], (err, result) => {
        if (err) {
          return res.status(400).send("Error deleting user: " + err.message);
        }
        res.status(200).json({
          message: "User deleted successfully",
          id: req.params.username,
        });
      });
    } catch (error) {
      res.status(400).send("Error deleting user: " + error.message);
    }
  }

  async getAllUser(req, res) {
    try {
      const query = "SELECT * FROM User";
      db.query(query, [], (err, results) => {
        if (err) {
          return res.status(400).send("Error getting all user: " + err.message);
        }
        console.log(results);
        res.status(200).json({ results });
      });
    } catch (error) {
      res.status(400).send("Error getting all user: " + error.message);
    }
  }
}

module.exports = new UserController();
