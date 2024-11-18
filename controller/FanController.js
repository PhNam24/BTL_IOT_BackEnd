const db = require('../config/db/mysql');

class FanController {
    async getAllFans(req, res) {
        try {
            const query = 'SELECT * FROM Fan';
            db.query(query, [], (err, results) => {
                if (err) {
                    return res.status(400).send('Error getting all Fans: ' + err.message);
                }
                console.log(results);
                res.status(200).json({ results });
            });
        } catch (error) {
            return res.status(400).send('Error getting all Fans: ' + error.message);
        }     
    }

    async turnOnFan(req, res) {
        try {
            let id = req.params.id;
            const query = 'UPDATE Fan SET status = 1 WHERE id = ?';
            db.query(query, [id], (err, results) => {
                if (err) {
                    return res.status(400).send('Error turning on fan: ' + err.message);
                }
                console.log(results);
                req.mqttPublish('fan', `{fan_id: ${id}, status: "ON"}`)
                res.status(200).json({ results });
            });
        } catch (error) {
            return res.status(400).send('Error turning on fan: ' + error.message);
        }
    }

    async turnOffFan(req, res) {
        try {
            let id = req.params.id;
            const query = 'UPDATE Fan SET status = 0 WHERE id = ?';
            db.query(query, [id], (err, results) => {
                if (err) {
                    return res.status(400).send('Error turning off fan: ' + err.message);
                }
                console.log(results);
                req.mqttPublish('fan', `{fan_id: ${id}, status: "OFF"}`)
                res.status(200).json({ results });
            });
        } catch (error) {
            return res.status(400).send('Error turning off fan: ' + error.message);
        }
    }
}

module.exports = new FanController();