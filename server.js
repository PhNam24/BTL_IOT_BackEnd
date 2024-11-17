const express = require('express');
const bodyParser = require('body-parser');
const cor = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const SensorController = require('./controller/SensorController');

const {client: mqttClient, connect, message} = require('./config/mqtt/mqtt');

const app = express();
const port = 3000;

// Connect to mqtt broker
connect();
message();
app.use((req, res, next) => {
    // Publish messages
    req.mqttPublish = function (topic, message) {
        mqttClient.publish(topic, message)
    }

    // Subscribe to topic
    req.mqttSubscribe = function (topic, callback) {
        mqttClient.subscribe(topic)
        mqttClient.on('message', function (t, m) {
            if (t === topic) {
                callback(m.toString())
            }
        })
    }
    next()
})

// Middleware
app.use(bodyParser.json());
app.use(cor());
app.use("/user", require("./routes/user"));
app.use("/device", require("./routes/device"));
app.use("/led", require("./routes/led"));
app.use("/fan", require("./routes/fan"));
app.use("/speaker", require("./routes/speaker"));
app.use("/sensor", require("./routes/sensor"));

const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('getNewestData', (sensorId) => {
        SensorController.getNewestData(sensorId, (err, data) => {
            if (err) {
                socket.emit('error', 'Error getting newest data: ' + err.message);
            } else {
                socket.emit('newestData', data);
            }
        });
    });

    socket.on('getHistoryData', (sensorId) => {
        SensorController.getHistoryData(sensorId, (err, data) => {
            if (err) {
                socket.emit('error', 'Error getting history data: ' + err.message);
            } else {
                socket.emit('historyData', data);
            }
        });
    });

    // Thêm các sự kiện cho turnOnSensor và turnOffSensor
    socket.on('turnOnSensor', (sensorId) => {
        SensorController.turnOnSensor(sensorId, (err, result) => {
            if (err) {
                socket.emit('error', 'Error turning on sensor: ' + err.message);
            } else {
                socket.emit('sensorStatusChanged', { sensorId, status: "ON" });
            }
        });
    });

    socket.on('turnOffSensor', (sensorId) => {
        SensorController.turnOffSensor(sensorId, (err, result) => {
            if (err) {
                socket.emit('error', 'Error turning off sensor: ' + err.message);
            } else {
                socket.emit('sensorStatusChanged', { sensorId, status: "OFF" });
            }
        });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// Start server
server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});