const express = require("express");
const bodyParser = require("body-parser");
const cor = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const SensorController = require("./controller/SensorController");

const { client: mqttClient, connect, message } = require("./config/mqtt/mqtt");

const app = express();
const port = 3000;


// Middleware
app.use(bodyParser.json());
app.use(cor(
    {
        origin: true,
        credentials: true,
    }
));
app.use("/user", require("./routes/user"));
app.use("/device", require("./routes/device"));
app.use("/led", require("./routes/led"));
app.use("/fan", require("./routes/fan"));
app.use("/speaker", require("./routes/speaker"));
app.use("/sensor", require("./routes/sensor"));

const server = http.createServer(app);
const io = socketIo(server);

app.use((req, res, next) => {
  // Publish messages
  req.mqttPublish = function (topic, message) {
    mqttClient.publish(topic, message);
  };

  // Subscribe to topic
  req.mqttSubscribe = function (topic, callback) {
    mqttClient.subscribe(topic);
    mqttClient.on("message", function (t, m) {
      if (t === topic) {
        callback(m.toString());
      }
    });
  };
  next();
});

<<<<<<< HEAD
// Start server
server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    // Connect to mqtt broker
    connect();
    message();
});
=======
// Middleware
app.use(bodyParser.json());
app.use(
  cor({
    origin: true,
    credentials: true,
  })
);
app.use("/user", require("./routes/user"));
app.use("/device", require("./routes/device"));
app.use("/led", require("./routes/led"));
app.use("/fan", require("./routes/fan"));
app.use("/speaker", require("./routes/speaker"));
app.use("/sensor", require("./routes/sensor"));
>>>>>>> b7a28a56d336563fab3ff93dc2cc032dbd34e5b7


io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("getNewestData", (sensorId) => {
    SensorController.getNewestData(sensorId, (err, data) => {
      if (err) {
        socket.emit("error", "Error getting newest data: " + err.message);
      } else {
        socket.emit("newestData", data);
      }
    });
  });

  socket.on("getHistoryData", (sensorId) => {
    SensorController.getHistoryData(sensorId, (err, data) => {
      if (err) {
        socket.emit("error", "Error getting history data: " + err.message);
      } else {
        socket.emit("historyData", data);
      }
    });
  });

  // Thêm các sự kiện cho turnOnSensor và turnOffSensor
  socket.on("turnOnSensor", (sensorId) => {
    SensorController.turnOnSensor(sensorId, (err, result) => {
      if (err) {
        socket.emit("error", "Error turning on sensor: " + err.message);
      } else {
        socket.emit("sensorStatusChanged", { sensorId, status: "ON" });
      }
    });
  });

  socket.on("turnOffSensor", (sensorId) => {
    SensorController.turnOffSensor(sensorId, (err, result) => {
      if (err) {
        socket.emit("error", "Error turning off sensor: " + err.message);
      } else {
        socket.emit("sensorStatusChanged", { sensorId, status: "OFF" });
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

<<<<<<< HEAD
mqttClient.publish("led_state", `{led_id: 1, status: "on"}`, (err) => {
    if (err) {
        console.error('Failed to send message:', err);
    } else {
        console.log(`Message sent to topic "led_state"`);
    }
});
=======
// Start server
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
>>>>>>> b7a28a56d336563fab3ff93dc2cc032dbd34e5b7
