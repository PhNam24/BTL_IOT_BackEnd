const db = require('../config/db/mysql');

class SensorController {
    getAllSensors(req, res) {
        try {
            const query = 'SELECT * FROM Sensor';
            db.query(query, [], (err, results) => {
                if (err) {
                    return res.status(400).send('Error getting all Sensors: ' + err.message);
                }
                console.log(results);
                res.status(200).json({ results });
            });
        } catch (error) {
            return res.status(400).send('Error getting all Sensors: ' + error.message);
        }     
    }

    turnOnSensor(req, res) {
        try {
            let id = req.params.id;
            const query = 'UPDATE Sensor SET status = 1 WHERE id = ?';
            db.query(query, [id], (err, results) => {
                if (err) {
                    return res.status(400).send('Error turning on sensor: ' + err.message);
                }
                console.log(results);
                req.mqttPublish('sensor_status', `{sensor_id: ${id}, status: "ON"}`)
                res.status(200).json({ results });
            });
        } catch (error) {
            return res.status(400).send('Error turning on sensor: ' + error.message);
        }
    }

    turnOffSensor(req, res) {
        try {
            let id = req.params.id;
            const query = 'UPDATE Sensor SET status = 0 WHERE id = ?';
            db.query(query, [id], (err, results) => {
                if (err) {
                    return res.status(400).send('Error turning off sensor: ' + err.message);
                }
                console.log(results);
                req.mqttPublish('sensor_status', `{sensor_id: ${id}, status: "OFF"}`)
                res.status(200).json({ results });
            });
        } catch (error) {
            return res.status(400).send('Error turning off sensor: ' + error.message);
        }
    }

    getNewestData(req, res) {
        try {
            let id = req.params.id;
            const query = 'SELECT * FROM History ORDER BY id DESC LIMIT 1 WHERE sensor_id = ?';
            db.query(query, [id], (err, results) => {
                if (err) {
                    return res.status(400).send('Error getting newest data: ' + err.message);
                }
                console.log(results);
                res.status(200).json({ results });
            });
        } catch (error) {
            return res.status(400).send('Error getting newest data: ' + error.message);
        }     
    }

    getHistoryData(req, res) {
        try {
            let id = req.params.id;
            const query = 'SELECT * FROM History WHERE sensor_id = ?';
            db.query(query, [id], (err, results) => {
                if (err) {
                    return res.status(400).send('Error getting history data: ' + err.message);
                }
                console.log(results);
                res.status(200).json({ results });
            });
        } catch (error) {
            return res.status(400).send('Error getting history data: ' + error.message);
        }     
    }

    testConnection(req, res) {
        req.mqttPublish('test', 'Hello MQTT in home')
        console.log(req.body)
        res.send('MQTT is working!')
    }
}

module.exports = new SensorController();