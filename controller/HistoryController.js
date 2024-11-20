const db = require("../config/db/mysql");

class HistoryController {
  async getHistory(req, res) {
    const { device_id, user_id } = req.body;

    try {
      const query =
        "SELECT * FROM History WHERE device_id = ? AND device_id IN (SELECT id FROM device WHERE user_id = ?)";
      db.query(query, [device_id, user_id], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Internal server error" });
        }
        const data = result.map((item) => ({
          id: item.id,
          temp: item.temperature,
          humid: item.humidity,
          timestamp: item.timestamp,
        }));

        console.log(data);

        res.status(200).json(data);
      });
    } catch (error) {
      return res.status(400).send(error);
    }
  }
}

module.exports = new HistoryController();
