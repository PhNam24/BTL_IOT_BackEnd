const db = require('../config/db/mysql');
const mqttClient = require('../config/mqtt/mqtt').client;

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

    turnOnSensor(sensorId, callback) {
        try {
            const query = 'UPDATE Sensor SET status = 1 WHERE id = ?';
            db.query(query, [sensorId], (err, results) => {
                if (err) {
                    return callback(err);
                }
                mqttClient.publish('sensor_status', `{sensor_id: ${sensorId}, status: "ON"}`);
                callback(null, results);
            });
        } catch (error) {
            callback(error);
        }
    }

    turnOffSensor(sensorId, callback) {
        try {
            const query = 'UPDATE Sensor SET status = 0 WHERE id = ?';
            db.query(query, [sensorId], (err, results) => {
                if (err) {
                    return callback(err);
                }
                mqttClient.publish('sensor_status', `{sensor_id: ${sensorId}, status: "OFF"}`);
                callback(null, results);
            });
        } catch (error) {
            callback(error);
        }
    }

    getNewestData(sensorId, callback) {
        try {
            const query = 'SELECT * FROM History WHERE sensor_id = ? ORDER BY id DESC LIMIT 1';
            db.query(query, [sensorId], (err, results) => {
                if (err) {
                    return callback(err);
                }
                callback(null, results);
            });
        } catch (error) {
            callback(error);
        }
    }

    getHistoryData(sensorId, callback) {
        try {
            const query = 'SELECT * FROM History WHERE sensor_id = ?';
            db.query(query, [sensorId], (err, results) => {
                if (err) {
                    return callback(err);
                }
                callback(null, results);
            });
        } catch (error) {
            callback(error);
        }
    }

    testConnection(req, res) {
        req.mqttPublish('test', 'Hello MQTT in home')
        console.log(req.body)
        res.send('MQTT is working!')
    }
}

module.exports = new SensorController();