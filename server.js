const express = require('express');
const bodyParser = require('body-parser');
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
app.use("/user", require("./routes/user"));
app.use("/device", require("./routes/device"));
app.use("/led", require("./routes/led"));
app.use("/fan", require("./routes/fan"));
app.use("/speaker", require("./routes/speaker"));
app.use("/sensor", require("./routes/sensor"));

// Start server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});