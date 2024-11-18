const db = require('../config/db/mysql');

class LedController {
    async getAllLeds(req, res) {
        try {
            const query = 'SELECT * FROM Led';
            db.query(query, [], (err, results) => {
                if (err) {
                    return res.status(400).send('Error getting all Leds: ' + err.message);
                }
                console.log(results);
                res.status(200).json({ results });
            });
        } catch (error) {
            return res.status(400).send('Error getting all Leds: ' + error.message);
        }     
    }

    async turnOnLed(req, res) {
        try {
            let id = req.params.id;
            const query = 'UPDATE Led SET status = 1 WHERE id = ?';
            db.query(query, [id], (err, results) => {
                if (err) {
                    return res.status(400).send('Error turning on led: ' + err.message);
                }
                req.mqttPublish('led_state', `{led_id: ${id}, status: "on"}`)
                res.status(200).json({ results });
            });
        } catch (error) {
            return res.status(400).send('Error turning on led: ' + error.message);
        }
    }

    async turnOffLed(req, res) {
        try {
            let id = req.params.id;
            const query = 'UPDATE Led SET status = 0 WHERE id = ?';
            db.query(query, [id], (err, results) => {
                if (err) {
                    return res.status(400).send('Error turning off led: ' + err.message);
                }
                req.mqttPublish('led_state', `{led_id: ${id}, status: "off"}`)
                res.status(200).json({ results });
            });
        } catch (error) {
            return res.status(400).send('Error turning off led: ' + error.message);
        }
    }
}

module.exports = new LedController();