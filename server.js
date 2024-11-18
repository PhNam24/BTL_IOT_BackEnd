const express = require("express");
const bodyParser = require("body-parser");
const cor = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const { client: mqttClient, connect, message } = require("./config/mqtt/mqtt");

const app = express();
const port = 3000;


// Middleware
app.use(bodyParser.json());
app.use(cor({
      origin: true,
      credentials: true,
      }
));
app.use("/user", require("./routes/user"));
app.use("/device", require("./routes/device"));

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

// Start server
server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    // Connect to mqtt broker
    connect();
    //message();
});


io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});